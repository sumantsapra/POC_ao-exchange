/* eslint-disable */
/* global WebImporter */

/**
 * aobrandplaybook.com.au (Framer) cleanup transformer.
 *
 * beforeTransform (runs before block parsers):
 *  - dedupe Framer breakpoint variants: drop every element carrying the
 *    desktop `hidden-<hash>` class (tablet/mobile-only copies, e.g. the 2nd and
 *    3rd div.ssr-variant of a group). Desktop hashes come from
 *    <style data-framer-breakpoint-css> (min-width-only media rules), with a
 *    fallback to the page root breakpoint classes.
 *  - keep inline-vector content artwork as images (before chrome removal, which
 *    drops the #svg-templates sprite sheet): <svg><use href="#svg-..."> sprites
 *    are resolved against their <symbol>/<svg> template, inline
 *    background-image:url(data:image/svg+xml,…) SVG components are extracted, and CSS mask-image
 *    vectors (Framer "Vector" layers, e.g. the /logos Core logos) are painted
 *    with their background colour; both become
 *    <img src="data:image/svg+xml;base64,..." data-excat-svg>. Decorative UI
 *    icons inside links / buttons (download arrow, copy buttons), small line /
 *    arrow / chevron glyphs (<= 24px) and chrome are not converted and are
 *    removed with the chrome / in finalCleanup.
 *    A vector sitting on a CSS-painted tile (logo-on-colour accessibility squares,
 *    badges, logo-version tiles) is rebuilt with that tile as one SVG
 *    (background colour / simple gradient, radius, Framer data-border outline).
 *  - remove global chrome: header, left chapter nav, homepage anchor nav,
 *    footer, #overlay, #template-overlay, Framer badge / editor bar.
 *  - strip scroll appear-effect inline styles (opacity / transform /
 *    will-change ...) so revealed content is never treated as hidden.
 *  - normalise text split into per-letter / per-word spans and <br>-split
 *    headings back to plain words.
 *  - content fixes confirmed by the user: "Who we are" revealed statement,
 *    homepage "Brand sound" link -> /brand-sound.
 *  - heading hierarchy: the highest-ranked heading of the first content section
 *    with a heading (media-only bands skipped) becomes the only <h1>, the line
 *    right after it becomes a <p>, every other <h1> becomes <h2>; homepage:
 *    #intro "creates ..." and #test "Every user ..." lines -> <p>,
 *    #onebrandsection "one brand" then "infinite flexibility", both <h2>.
 *
 * afterTransform (after block parsers):
 *  - leftover <video> elements -> plain MP4 / Supabase links.
 *  - remove inline data: URI icons (but keep the data:image/svg+xml artwork images
 *    created in beforeTransform), scripts/styles/links, Framer attributes.
 *  - never touches HTML comments or data-excat-* markers.
 */

// Desktop breakpoint hashes observed on the analysed pages (fallback only).
const KNOWN_DESKTOP_HASHES = ['1rffoj4', '1vfv6mq', '71r3xb', '6yolz5'];

const WHO_WE_ARE_TEXT = "The AO isn't just a tournament. We redefine what a Grand Slam can be. Our brand archetype is the Game Changer: bold, inventive, and unafraid to rewrite the rules.";

const APPEAR_STYLE_PROPS = [
  'opacity',
  'transform',
  'will-change',
  'visibility',
  'filter',
  'transform-origin',
  'translate',
  'scale',
  'rotate',
];

function collapse(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function getDesktopHashes(document) {
  const hashes = new Set();
  document.querySelectorAll('style').forEach((style) => {
    const css = style.textContent || '';
    if (!css.includes('.hidden-')) return;
    // min-width-only media rule = largest (desktop) breakpoint
    const re = /@media\s*\(\s*min-width:\s*[\d.]+px\s*\)\s*\{\s*\.hidden-([a-z0-9]+)\s*\{\s*display:\s*none/gi;
    let m = re.exec(css);
    while (m) {
      hashes.add(m[1]);
      m = re.exec(css);
    }
  });
  if (hashes.size) return hashes;

  // Fallback: page root breakpoint classes (#main > div.framer-<hash>, one level down).
  const hiddenUsed = new Set();
  document.querySelectorAll('[class*="hidden-"]').forEach((el) => {
    el.classList.forEach((c) => {
      const m = c.match(/^hidden-([a-z0-9]+)$/);
      if (m) hiddenUsed.add(m[1]);
    });
  });
  const roots = [...document.querySelectorAll('#main > div, #main > div > div')];
  roots.forEach((el) => {
    el.classList.forEach((c) => {
      const m = c.match(/^framer-([a-z0-9]{5,8})$/);
      if (m && hiddenUsed.has(m[1])) hashes.add(m[1]);
    });
  });
  KNOWN_DESKTOP_HASHES.forEach((h) => { if (hiddenUsed.has(h)) hashes.add(h); });
  return hashes;
}

function dedupeBreakpoints(document) {
  const hashes = getDesktopHashes(document);
  if (!hashes.size) return;
  const selector = [...hashes].map((h) => `.hidden-${h}`).join(',');
  document.querySelectorAll(selector).forEach((el) => {
    if (el.isConnected) el.remove();
  });
}

function removeEmptyWrapper(el) {
  // Climb Framer "-container" / ssr-variant wrappers that only held the chrome.
  let node = el;
  while (node && node.parentElement) {
    const parent = node.parentElement;
    if (parent.id === 'main' || parent.tagName === 'BODY') break;
    const isWrapper = /(^|\s)ssr-variant(\s|$)|-container(\s|$)/.test(parent.className || '');
    const siblings = [...parent.children].filter((c) => c !== node);
    if (isWrapper && siblings.length === 0) {
      node = parent;
    } else {
      break;
    }
  }
  node.remove();
}

function isAnchorOnlyNav(el) {
  const links = [...el.querySelectorAll('a')];
  if (links.length < 3) return false;
  if (el.querySelector('img, video, picture, svg, h1, h2, h3, h4, h5, h6')) return false;
  return links.every((a) => /^(\.\/|\/)?#/.test(a.getAttribute('href') || ''));
}

function removeChrome(document) {
  WebImporter.DOMUtils.remove(document.body || document, [
    'header',
    'nav',
    'footer',
    '#overlay',
    '#template-overlay',
    '#svg-templates',
    '#__framer-badge-container',
    '[class*="framer-badge"]',
    'iframe#__framer-editorbar',
    'iframe[src*="framer.com/edit"]',
    'script',
    'noscript',
    'link',
    'meta',
  ]);

  // Chrome wrappers left empty (header / nav / footer -container wrappers).
  document.querySelectorAll('#main [class*="-container"], #main .ssr-variant').forEach((el) => {
    if (!el.isConnected) return;
    if (!collapse(el.textContent) && !el.querySelector('img, video, picture, source, svg, iframe')) {
      // keep empty containers that sit inside content sections: harmless, but
      // only remove those outside any section to avoid touching block targets.
      if (!el.closest('section, main, [id]:not(#main)')) removeEmptyWrapper(el);
    }
  });

  // Homepage fixed left page nav (Intro / Who we are / ... / Toolkits): only
  // in-page anchor links, outside the content sections.
  const candidates = [...document.querySelectorAll('#main div')]
    .filter((el) => !el.closest('section, main, #hero, #summary') && isAnchorOnlyNav(el));
  candidates
    .filter((el) => !candidates.some((other) => other !== el && other.contains(el)))
    .forEach((el) => { if (el.isConnected) removeEmptyWrapper(el); });

  // Custom cursor / pointer overlays with no authorable content.
  document.querySelectorAll('[class*="framer-pointer-events-none"]').forEach((el) => {
    if (!collapse(el.textContent) && !el.querySelector('img, video, picture')) el.remove();
  });
}

/* ------------------------------------------------------------------ */
/* Inline-vector artwork -> <img src="data:image/svg+xml;base64,...">  */
/* ------------------------------------------------------------------ */

const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_DATA_PREFIX = 'data:image/svg+xml;base64,';

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

function computedStyle(document, el) {
  const view = document.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return null;
  try { return view.getComputedStyle(el); } catch (e) { return null; }
}

/** Resolve var(--token, fallback) against the page root (live browser), else use the fallback. */
function resolveVars(document, value) {
  if (!value || value.indexOf('var(') === -1) return value;
  const rootStyle = computedStyle(document, document.documentElement);
  let out = value;
  for (let guard = 0; guard < 10 && out.indexOf('var(') !== -1; guard += 1) {
    out = out.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g, (m, name, fallback) => {
      const live = rootStyle ? (rootStyle.getPropertyValue(name) || '').trim() : '';
      return live || (fallback || '').trim() || 'currentColor';
    });
  }
  return out;
}

/** UI icons in links / buttons (download arrow, copy controls) and chrome are decoration. */
function isDecorativeSvgHost(el) {
  return !!el.closest('a, button, header, nav, footer, [role="button"]');
}

/**
 * Small UI glyphs named as lines / arrows / chevrons (e.g. the Playful <> Premium toggle arrows on
 * the homepage and /tone-of-voice, 19px) are decoration, not artwork. Larger "Line" vectors (the
 * red strike of inaccessible logo pairs) are kept.
 */
function isDecorativeGlyph(el, w, h) {
  if (!(w && h && w <= 24 && h <= 24)) return false;
  for (let n = el, d = 0; n && d < 4; n = n.parentElement, d += 1) {
    const name = (n.getAttribute && n.getAttribute('data-framer-name')) || '';
    if (/^(line|arrow|chevron|caret)\b/i.test(name)) return true;
  }
  return false;
}

/** Rendered size in the live browser, else the declared size. */
function sizeOf(el, fallbackW, fallbackH) {
  let w = 0;
  let h = 0;
  if (typeof el.getBoundingClientRect === 'function') {
    const r = el.getBoundingClientRect();
    w = Math.round(r.width);
    h = Math.round(r.height);
  }
  return { w: w || Math.round(fallbackW || 0), h: h || Math.round(fallbackH || 0) };
}

function serialiseSvg(svg) {
  const xml = new XMLSerializer().serializeToString(svg);
  return xml.indexOf('xmlns="') === -1 ? xml.replace('<svg', `<svg xmlns="${SVG_NS}"`) : xml;
}

function artworkImg(document, markup, alt, w, h) {
  const img = document.createElement('img');
  img.setAttribute('src', `${SVG_DATA_PREFIX}${toBase64(markup)}`);
  img.setAttribute('alt', alt || '');
  if (w) img.setAttribute('width', String(w));
  if (h) img.setAttribute('height', String(h));
  img.setAttribute('data-excat-svg', 'true');
  return img;
}

/** A descriptive Framer layer name of the artwork (e.g. "AO27 BLUE 1"), skipping generic ones. */
function artworkAlt(el) {
  for (let n = el; n && n.tagName !== 'SECTION'; n = n.parentElement) {
    const name = n.getAttribute && n.getAttribute('data-framer-name');
    if (name && !/^(vector|logo placeholder|img|frame \d+|placeholder|container|graphic|icon|type)$/i.test(name)) return name;
  }
  return '';
}

function resolveSvgTree(document, root, color) {
  [root, ...root.querySelectorAll('*')].forEach((node) => {
    [...node.attributes].forEach((attr) => {
      let v = resolveVars(document, attr.value);
      if (color && /currentcolor/i.test(v)) v = v.replace(/currentcolor/gi, color);
      if (v !== attr.value) node.setAttribute(attr.name, v);
    });
  });
}

/** <svg><use href="#id"></svg> sprites -> standalone copy of the referenced template. */
function convertUseSprites(document) {
  const root = document.querySelector('#main') || document.body;
  [...root.querySelectorAll('svg')].forEach((svg) => {
    if (!svg.isConnected || svg.parentElement.closest('svg') || isDecorativeSvgHost(svg)) return;
    const use = svg.querySelector('use');
    let out;
    if (use) {
      const ref = (use.getAttribute('href') || use.getAttribute('xlink:href') || '').replace(/^#/, '');
      const tmpl = ref && document.getElementById(ref);
      if (!tmpl) return;
      if (tmpl.tagName.toLowerCase() === 'symbol') {
        out = document.createElementNS(SVG_NS, 'svg');
        [...tmpl.childNodes].forEach((c) => out.appendChild(c.cloneNode(true)));
        const vb = tmpl.getAttribute('viewBox') || svg.getAttribute('viewBox');
        if (vb) out.setAttribute('viewBox', vb);
      } else {
        out = tmpl.cloneNode(true);
      }
    } else {
      out = svg.cloneNode(true);
    }
    out.removeAttribute('id');
    out.removeAttribute('style');
    const style = computedStyle(document, svg);
    resolveSvgTree(document, out, style && style.color ? style.color : '');
    if (!out.getAttribute('viewBox') && svg.getAttribute('viewBox')) out.setAttribute('viewBox', svg.getAttribute('viewBox'));
    const vb = (out.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const host = svg.parentElement || svg;
    const { w, h } = sizeOf(host, parseFloat(out.getAttribute('width')) || vb[2], parseFloat(out.getAttribute('height')) || vb[3]);
    if (isDecorativeGlyph(host, w, h)) return; // left as <svg>, removed in finalCleanup
    if (w) out.setAttribute('width', String(w));
    if (h) out.setAttribute('height', String(h));
    svg.replaceWith(artworkImg(document, serialiseSvg(out), artworkAlt(host), w, h));
  });
}

/** Class rules `-webkit-mask:url("data:image/svg+xml,<svg ...>")` with the paint in background-color. */
function maskRules(document) {
  const rules = {};
  document.querySelectorAll('style').forEach((style) => {
    const css = style.textContent || '';
    if (css.indexOf('mask:url("data:image/svg+xml,') === -1) return;
    const re = /\.(framer-[A-Za-z0-9_-]+)\{([^{}]*?mask:url\("data:image\/svg\+xml,[^{}]*)\}/g;
    let m = re.exec(css);
    while (m) {
      const body = m[2];
      const svgMatch = body.match(/mask:url\("data:image\/svg\+xml,((?:\\.|[^"\\])*)"\)/);
      const bg = body.match(/background-color:((?:[^;()]|\((?:[^()]|\([^()]*\))*\))*)/);
      if (svgMatch) rules[m[1]] = { svg: svgMatch[1].replace(/\\(.)/g, '$1'), bg: bg ? bg[1].trim() : '' };
      m = re.exec(css);
    }
  });
  return rules;
}

/** CSS mask-image vectors (Framer "Vector" layers) -> an <img> of the vector painted in its colour. */
function convertMaskVectors(document) {
  const rules = maskRules(document);
  const names = Object.keys(rules);
  if (!names.length) return;
  const root = document.querySelector('#main') || document.body;
  root.querySelectorAll(names.map((n) => `.${n}`).join(',')).forEach((el) => {
    if (!el.isConnected || isDecorativeSvgHost(el)) return;
    const rule = rules[names.find((n) => el.classList.contains(n))];
    let markup = rule.svg;
    try { markup = decodeURIComponent(markup); } catch (e) { /* not URI-encoded */ }
    const style = computedStyle(document, el);
    const live = style && style.backgroundColor;
    let color = live && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(live) ? live : resolveVars(document, rule.bg);
    if (!color || /var\(|currentcolor/i.test(color)) color = '#000';
    const tmp = document.createElement('div');
    tmp.innerHTML = markup;
    const svg = tmp.querySelector('svg');
    if (!svg) return;
    // the mask is alpha only: paint every shape in the element's background colour
    let painted = false;
    [svg, ...svg.querySelectorAll('*')].forEach((n) => {
      if (n.hasAttribute('fill') && n.getAttribute('fill') !== 'none') { n.setAttribute('fill', color); painted = true; }
      if (n.hasAttribute('stroke') && n.getAttribute('stroke') !== 'none') { n.setAttribute('stroke', color); painted = true; }
    });
    if (!painted) svg.setAttribute('fill', color);
    svg.removeAttribute('id');
    svg.removeAttribute('display');
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const { w, h } = sizeOf(el, parseFloat(svg.getAttribute('width')) || vb[2], parseFloat(svg.getAttribute('height')) || vb[3]);
    if (isDecorativeGlyph(el, w, h)) return;
    if (w) svg.setAttribute('width', String(w));
    if (h) svg.setAttribute('height', String(h));
    el.setAttribute('data-excat-mask', 'true');
    el.appendChild(artworkImg(document, serialiseSvg(svg), artworkAlt(el), w, h));
  });
}

/** Framer SVG components drawn as an inline `background-image:url('data:image/svg+xml,…')`. */
function convertBackgroundVectors(document) {
  const root = document.querySelector('#main') || document.body;
  root.querySelectorAll('[style*="data:image/svg+xml"]').forEach((el) => {
    if (!el.isConnected || isDecorativeSvgHost(el) || el.querySelector('img')) return;
    const style = el.getAttribute('style') || '';
    const m = style.match(/background-image\s*:\s*url\((['"]?)(data:image\/svg\+xml,.*?)\1\)/);
    if (!m) return;
    let markup = m[2].replace(/^data:image\/svg\+xml,/, '');
    try { markup = decodeURIComponent(markup); } catch (e) { /* not URI-encoded */ }
    const tmp = document.createElement('div');
    tmp.innerHTML = markup;
    const svg = tmp.querySelector('svg');
    if (!svg) return;
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    const { w, h } = sizeOf(el, parseFloat(svg.getAttribute('width')) || vb[2], parseFloat(svg.getAttribute('height')) || vb[3]);
    if (isDecorativeGlyph(el, w, h)) return;
    if (w) svg.setAttribute('width', String(w));
    if (h) svg.setAttribute('height', String(h));
    el.setAttribute('style', style.replace(m[0], '').replace(/;\s*;/g, ';'));
    el.appendChild(artworkImg(document, serialiseSvg(svg), artworkAlt(el), w, h));
  });
}

/* Artwork tiles: a logo drawn as a vector on a CSS-painted square (accessibility squares,
 * badges, logo-version tiles) loses its square when only the vector is kept. Such a tile is
 * rebuilt as one SVG: the tile's paint (background colour or simple linear gradient, radius,
 * Framer data-border outline) plus the artwork images placed where they render. */

function paintOf(document, el) {
  const cs = computedStyle(document, el);
  if (!cs) return null;
  const val = (prop) => resolveVars(document, (cs.getPropertyValue(prop) || '').trim());
  let fill = val('background-color');
  if (/^(transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\))$/.test(fill.replace(/\s+/g, ' '))) fill = '';
  let gradient = null;
  const bgImage = val('background-image');
  const lg = bgImage.match(/linear-gradient\((.*)\)/);
  if (lg) {
    const parts = lg[1].split(/,(?![^(]*\))/).map((p) => p.trim());
    let angle = 180;
    if (/deg$/.test(parts[0])) angle = parseFloat(parts.shift());
    else if (/^to /.test(parts[0])) {
      const dir = parts.shift();
      angle = { 'to top': 0, 'to right': 90, 'to bottom': 180, 'to left': 270 }[dir] ?? 180;
    }
    const stops = parts.map((p, i) => {
      const m = p.match(/^(.*?)(?:\s+([\d.]+)%)?$/);
      return { color: m[1], offset: m[2] !== undefined ? parseFloat(m[2]) : (i / Math.max(1, parts.length - 1)) * 100 };
    });
    if (stops.length >= 2) gradient = { angle, stops };
  }
  // Framer outlines (::after) use inherited --border-* custom properties: only an element
  // carrying data-border="true" draws them
  const framerBorder = el.getAttribute('data-border') === 'true';
  const borderW = (framerBorder && parseFloat(val('--border-top-width'))) || parseFloat(cs.borderTopWidth) || 0;
  let borderC = (framerBorder && val('--border-color')) || (parseFloat(cs.borderTopWidth) ? cs.borderTopColor : '');
  if (/^none$/.test(borderC)) borderC = '';
  const radius = parseFloat(cs.borderTopLeftRadius) || parseFloat(cs.borderRadius) || 0;
  if (!fill && !gradient && !(borderW && borderC)) return null;
  return { fill, gradient, borderW: borderC ? borderW : 0, borderC, radius };
}

function isArtworkImg(img) {
  return img.hasAttribute('data-excat-svg');
}

function overlap(a, b) {
  if (typeof a.getBoundingClientRect !== 'function') return true;
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  if (!r1.width || !r2.width) return true; // no layout (tests): assume one tile
  return r1.left < r2.right && r2.left < r1.right && r1.top < r2.bottom && r2.top < r1.bottom;
}

/** Highest text-free ancestor (<= 6 levels, inside its section) holding one artwork (or logo + strike). */
function artworkTile(document, img) {
  let best = null;
  let node = img.parentElement;
  for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) {
    if (node.tagName === 'SECTION' || node.id === 'main') break;
    if ((node.textContent || '').trim()) break;
    const imgs = [...node.querySelectorAll('img')];
    if (!imgs.length || imgs.length > 2 || !imgs.every(isArtworkImg) || node.querySelector('video')) break;
    // two artworks form one tile only when they overlap (logo + strike-through line)
    if (imgs.length === 2 && !overlap(imgs[0], imgs[1])) break;
    let large = false;
    if (typeof node.getBoundingClientRect === 'function') {
      const r = node.getBoundingClientRect();
      if (r.width > 700 || r.height > 700) break;
      large = r.width > 400 || r.height > 400;
    }
    const own = node.hasAttribute('data-excat-mask') ? null : paintOf(document, node);
    const layer = own ? null : [...node.children].find((c) => !c.querySelector('img') && paintOf(document, c));
    const paint = own || (layer && paintOf(document, layer));
    // large white frames (e.g. /logos wordmark lockups, 570x350) are drawn by cards-framed itself
    const white = paint && !paint.gradient && /^(#fff(fff)?|white|rgb\(255, 255, 255\))$/i.test((paint.fill || '').trim());
    if (paint && !(large && (white || !paint.fill))) best = { tile: node, paint };
  }
  return best;
}

function rectIn(el, box) {
  if (!box || typeof el.getBoundingClientRect !== 'function') return null;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
}

function xmlEsc(v) {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function compositeTile(document, tile, paint) {
  const imgs = [...tile.querySelectorAll('img')].filter(isArtworkImg);
  const boxRect = typeof tile.getBoundingClientRect === 'function' ? tile.getBoundingClientRect() : null;
  const box = boxRect && boxRect.width && boxRect.height ? boxRect : null;
  const sizes = imgs.map((i) => ({ w: parseFloat(i.getAttribute('width')) || 60, h: parseFloat(i.getAttribute('height')) || 60 }));
  const W = Math.round(box ? box.width : Math.max(90, ...sizes.map((s) => s.w * 1.6)));
  const H = Math.round(box ? box.height : Math.max(90, ...sizes.map((s) => s.h * 1.6)));
  const defs = [];
  let fill = paint.fill || 'none';
  if (paint.gradient) {
    const a = ((paint.gradient.angle - 90) * Math.PI) / 180;
    const x1 = 50 - Math.cos(a) * 50;
    const y1 = 50 - Math.sin(a) * 50;
    defs.push(`<linearGradient id="g" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${(100 - x1).toFixed(1)}%" y2="${(100 - y1).toFixed(1)}%">${
      paint.gradient.stops.map((s) => `<stop offset="${s.offset}%" stop-color="${xmlEsc(s.color)}"/>`).join('')}</linearGradient>`);
    fill = 'url(#g)';
  }
  const bw = paint.borderW || 0;
  const rect = `<rect x="${bw / 2}" y="${bw / 2}" width="${W - bw}" height="${H - bw}" rx="${paint.radius}" fill="${xmlEsc(fill)}"${
    bw ? ` stroke="${xmlEsc(paint.borderC)}" stroke-width="${bw}"` : ''}/>`;
  const parts = imgs.map((img, i) => {
    const r = rectIn(img, box) || { w: sizes[i].w, h: sizes[i].h, x: (W - sizes[i].w) / 2, y: (H - sizes[i].h) / 2 };
    return `<image href="${xmlEsc(img.getAttribute('src'))}" x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}"/>`;
  });
  const svg = `<svg xmlns="${SVG_NS}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${rect}${parts.join('')}</svg>`;
  const alt = imgs.map((i) => i.getAttribute('alt')).find(Boolean) || artworkAlt(tile);
  const out = artworkImg(document, svg, alt, W, H);
  out.setAttribute('data-excat-tile', 'true');
  tile.replaceChildren(out);
}

function compositeArtworkTiles(document) {
  const root = document.querySelector('#main') || document.body;
  const done = new Set();
  [...root.querySelectorAll('img[data-excat-svg]')].forEach((img) => {
    if (!img.isConnected || img.hasAttribute('data-excat-tile')) return;
    const found = artworkTile(document, img);
    if (!found || done.has(found.tile)) return;
    done.add(found.tile);
    compositeTile(document, found.tile, found.paint);
  });
}

function inlineSvgArtwork(document) {
  convertMaskVectors(document);
  convertBackgroundVectors(document);
  convertUseSprites(document);
  compositeArtworkTiles(document);
}

function stripAppearStyles(document) {
  document.querySelectorAll('[style]').forEach((el) => {
    const style = el.getAttribute('style') || '';
    const kept = style
      .split(';')
      .map((d) => d.trim())
      .filter((d) => {
        if (!d) return false;
        const prop = d.split(':')[0].trim().toLowerCase();
        return !APPEAR_STYLE_PROPS.includes(prop);
      });
    if (kept.length) el.setAttribute('style', kept.join(';'));
    else el.removeAttribute('style');
  });
}

function isLetterSpan(el) {
  return el.tagName === 'SPAN' && el.children.length === 0
    && el.textContent.length > 0 && el.textContent.trim().length <= 1;
}

function isWordSpan(el) {
  if (el.tagName !== 'SPAN' || el.children.length === 0) return false;
  if (![...el.children].every(isLetterSpan)) return false;
  return [...el.childNodes].every((n) => n.nodeType !== 3 || !n.textContent.trim());
}

function joinedText(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return '';
  if (node.tagName === 'BR') return ' ';
  if (isWordSpan(node)) return [...node.children].map((c) => c.textContent).join('');
  return [...node.childNodes].map(joinedText).join('');
}

function normaliseSplitText(document) {
  const textEls = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li')];
  textEls.forEach((el) => {
    if (!el.isConnected) return;
    const letterSpans = [...el.querySelectorAll('span')].filter(isLetterSpan);
    const letterSplit = letterSpans.length >= 3;
    const brSplitHeading = /^H[1-6]$/.test(el.tagName)
      && el.querySelector('br')
      && !el.querySelector('em, i, a, img, picture, video');
    if (!letterSplit && !brSplitHeading) return;
    const text = collapse(joinedText(el));
    if (text) el.textContent = text;
  });
}

function applyContentFixes(document) {
  // "Who we are": use the fully revealed statement, drop any faint base layer.
  const statements = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
    .filter((el) => /^The AO isn[’']t just a tournament/i.test(collapse(el.textContent)));
  if (statements.length) {
    const keep = statements.find((el) => /bold, inventive/i.test(el.textContent)) || statements[0];
    keep.textContent = WHO_WE_ARE_TEXT;
    statements.filter((el) => el !== keep).forEach((el) => {
      // remove only if it is a duplicate layer of the same statement block
      if (el.isConnected) el.remove();
    });
  }

  // Homepage toolkit link "Brand sound" points at ./ in the source.
  document.querySelectorAll('a').forEach((a) => {
    if (collapse(a.textContent).toLowerCase() !== 'brand sound') return;
    const href = (a.getAttribute('href') || '').trim();
    if (/^(\.\/?|\/|https?:\/\/[^/]+\/?)?$/.test(href)) a.setAttribute('href', '/brand-sound');
  });

  // Homepage intro: "creates a feeling like no other." is only rendered by a scroll animation,
  // so it is missing from the desktop DOM. Add it after the "Tennis down under" heading.
  const introHeading = document.querySelector('#intro h1, #intro h2');
  if (introHeading && !/feeling like no other/i.test(collapse(document.querySelector('#intro').textContent))) {
    const p = document.createElement('p');
    p.append('creates ');
    const em = document.createElement('em');
    em.textContent = 'a feeling like no other.';
    p.append(em);
    introHeading.after(p);
  }
}

/* ------------------------------------------------------------------ */
/* Heading hierarchy: one H1 = page title, lead line = paragraph       */
/* ------------------------------------------------------------------ */

const HEADING_SEL = 'h1, h2, h3, h4, h5, h6';

function headingLevel(el) {
  return /^H([1-6])$/.test(el.tagName) ? Number(el.tagName[1]) : 0;
}

/** Replace el with a <tag> carrying the same attributes and children. */
function retag(document, el, tag) {
  if (el.tagName.toLowerCase() === tag) return el;
  const out = document.createElement(tag);
  [...el.attributes].forEach((a) => out.setAttribute(a.name, a.value));
  while (el.firstChild) out.appendChild(el.firstChild);
  el.replaceWith(out);
  return out;
}

/** Headings / paragraphs an author would type (not link / button labels, not empty). */
function authorableText(root) {
  return [...root.querySelectorAll(`${HEADING_SEL}, p`)]
    .filter((el) => collapse(el.textContent) && !el.closest('a, button, [role="button"]'));
}

/** Top-level content section holding el (Framer: <section> or an id'd band such as #hero). */
function sectionOf(el, root) {
  return el.closest('section') || el.closest('[id]:not(#main)') || root;
}

function normaliseHeadings(document) {
  const root = document.querySelector('#main') || document.body;
  if (!root) return;
  const texts = authorableText(root);
  const firstHeading = texts.find((el) => headingLevel(el));
  if (!firstHeading) return;

  // Title section = first content section with a heading (media-only bands such as the
  // sub-brand hero-banner video have none). Its title = highest-ranked heading in it, so an
  // eyebrow above the title is not promoted.
  const titleSection = sectionOf(firstHeading, root);
  const sectionTexts = texts.filter((el) => titleSection.contains(el));
  const sectionHeadings = sectionTexts.filter((el) => headingLevel(el));
  const top = Math.min(...sectionHeadings.map(headingLevel));
  const titleSrc = sectionHeadings.find((el) => headingLevel(el) === top);
  const lead = sectionTexts[sectionTexts.indexOf(titleSrc) + 1];

  // Every other H1 on the page becomes an H2 (homepage "tennis down under").
  root.querySelectorAll('h1').forEach((h) => { if (h !== titleSrc) retag(document, h, 'h2'); });
  retag(document, titleSrc, 'h1');
  // Lead / intro line right after the title (Framer h4) is a paragraph.
  if (lead && headingLevel(lead)) retag(document, lead, 'p');

  // Homepage section fixes (ids are the source's section anchors).
  // Display headings stacked one word per line (<strong>tennis</strong><strong><br></strong>…)
  // can reach this point without their <br>, so the words would run together: one word per
  // text node, joined with spaces.
  const wordsOf = (h) => {
    if (h.querySelector('em, i, a, img, picture, video')) return;
    const walker = document.createTreeWalker(h, 4);
    const words = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = collapse(n.textContent);
      if (t) words.push(t);
    }
    if (words.length > 1) h.textContent = words.join(' ');
  };

  const intro = document.querySelector('#intro');
  if (intro) {
    intro.querySelectorAll('h2').forEach(wordsOf);
    // "creates <em>a feeling like no other.</em>" after the section heading is a paragraph.
    const introLine = [...intro.querySelectorAll('h3, h4, h5, h6')]
      .find((h) => /^creates\b/i.test(collapse(h.textContent)));
    if (introLine) {
      const p = retag(document, introLine, 'p');
      const span = p.querySelector('span');
      if (span && !p.querySelector('em')) {
        const em = document.createElement('em');
        em.textContent = collapse(span.textContent);
        span.replaceWith(em);
      }
    }
  }

  const oneBrand = document.querySelector('#onebrandsection');
  if (oneBrand) {
    // The swap animation puts "infinite flexibility" before "one brand" in the DOM.
    const heads = [...oneBrand.querySelectorAll('h2, h3, h4')];
    const one = heads.find((h) => /^one\s*brand$/i.test(collapse(h.textContent)));
    const flex = heads.find((h) => /^infinite\s*flexibility$/i.test(collapse(h.textContent)));
    if (one && flex) {
      // eslint-disable-next-line no-bitwise
      if (one.compareDocumentPosition(flex) & 2) one.after(flex); // flex precedes one
      wordsOf(retag(document, one, 'h2'));
      wordsOf(retag(document, flex, 'h2'));
    }
  }

  // "Every user of our brand can find their place on a scale we call" is a paragraph.
  document.querySelectorAll('#test h4').forEach((h) => {
    if (!/^every user of our brand/i.test(collapse(h.textContent))) return;
    const p = retag(document, h, 'p');
    p.textContent = collapse(joinedText(p));
  });
}

/**
 * Framer styles some text runs with <code class="framer-text"> (e.g. the /tone-of-voice lead and
 * principle copy); the site has no code samples, so every <code> is unwrapped to plain text.
 * Empty inline runs holding only a line break are unwrapped too, so the <br> survives.
 */
function unwrapCode(document) {
  const root = document.querySelector('#main') || document.body;
  // Framer line breaks wrapped in an empty run (<strong><br></strong>, e.g. /typography "Arial",
  // /tone-of-voice social names) are dropped with the empty run by the HTML conversion: keep the <br>
  [...root.querySelectorAll('strong, b, em, i, span')].forEach((run) => {
    if (run.isConnected && !(run.textContent || '').trim() && run.querySelector('br') && !run.querySelector('img, svg, video')) {
      run.replaceWith(...run.childNodes);
    }
  });
  [...root.querySelectorAll('code')].forEach((code) => {
    if (code.closest('pre')) return;
    code.replaceWith(...code.childNodes);
  });
}

/**
 * Tone scale heading (/tone-of-voice "Playful <-> Premium"): a flex row of two one-word headings
 * with a decorative double-arrow glyph between them becomes one authorable heading
 * <h2><em>Playful</em> ↔ Premium</h2> (em = the accent word, process blue). The homepage scale
 * is a different, animated component and is left as it is.
 */
function scaleHeadings(document) {
  const root = document.querySelector('#main') || document.body;
  const heads = [...root.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const done = new Set();
  heads.forEach((h) => {
    if (done.has(h) || !h.isConnected) return;
    // the row: nearest ancestor holding exactly two headings and nothing else with text
    let row = h.parentElement;
    for (let i = 0; row && i < 4; i += 1, row = row.parentElement) {
      if (row.querySelectorAll('h1, h2, h3, h4, h5, h6').length >= 2) break;
    }
    if (!row || row.tagName === 'SECTION') return;
    const pair = [...row.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    if (pair.length !== 2 || row.querySelector('img, video, p')) return;
    const words = pair.map((x) => collapse(x.textContent));
    if (!words.every((w) => w && w.split(' ').length <= 2)) return;
    if (collapse(row.textContent).replace(/\s/g, '') !== words.join('').replace(/\s/g, '')) return;
    // a decorative glyph group (the arrows) sits between the two headings
    const kids = [...row.children];
    const a = kids.findIndex((k) => k.contains(pair[0]));
    const b = kids.findIndex((k) => k.contains(pair[1]));
    if (a === -1 || b - a < 2 || kids.slice(a + 1, b).some((k) => collapse(k.textContent))) return;
    const out = document.createElement('h2');
    const em = document.createElement('em');
    em.textContent = words[0];
    out.append(em, ` ↔ ${words[1]}`);
    // keep the row's centring for the section transformer's "centered" check (live browser)
    if (typeof row.getBoundingClientRect === 'function' && row.parentElement) {
      const r = row.getBoundingClientRect();
      const p = row.parentElement.getBoundingClientRect();
      if (r.width && Math.abs((r.left + r.right) / 2 - (p.left + p.right) / 2) <= 24) out.style.textAlign = 'center';
    }
    row.replaceWith(out);
    pair.forEach((x) => done.add(x));
  });
}

/**
 * Framer pill buttons (a painted, rounded link at least 40px tall with a text label, e.g. /logos
 * "Download Logos") become the EDS button convention: <p><strong><a>label</a></strong></p>
 * (decorateButtons turns a bold lone link into a.button). The pill's download glyph is drawn by
 * the button style for labels that mention "download" (styles.css).
 */
function pillButtons(document) {
  const root = document.querySelector('#main') || document.body;
  [...root.querySelectorAll('a[href]')].forEach((a) => {
    if (!a.isConnected || a.closest('header, nav, footer')) return;
    const label = collapse(a.textContent);
    if (!label || label.split(' ').length > 6 || typeof a.getBoundingClientRect !== 'function') return;
    const cs = computedStyle(document, a);
    if (!cs) return;
    const r = a.getBoundingClientRect();
    const painted = !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor);
    if (!painted || parseFloat(cs.borderTopLeftRadius) < 15 || r.height < 40) return;
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const link = document.createElement('a');
    link.setAttribute('href', a.getAttribute('href'));
    link.textContent = label;
    strong.append(link);
    p.append(strong);
    a.replaceWith(p);
  });
}

function videosToLinks(document) {
  document.querySelectorAll('video').forEach((video) => {
    const src = video.getAttribute('src')
      || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src'));
    if (!src) {
      video.remove();
      return;
    }
    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;
    video.replaceWith(a);
  });
}

// Framer serves the uploaded original (often 5-37 MB); its CDN scales raster images on request.
// GIFs are not resized by the CDN, SVGs need no resizing.
const FRAMER_IMAGE = /^(https?:)?\/\/framerusercontent\.com\/images\/[^?#]+\.(jpe?g|png|webp)(\?[^#]*)?$/i;

function capFramerImages(document) {
  document.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!FRAMER_IMAGE.test(src)) return;
    img.setAttribute('src', `${src.split('?')[0]}?scale-down-to=2048`);
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
  });
  document.querySelectorAll('picture source').forEach((source) => source.remove());
}

function finalCleanup(document) {
  WebImporter.DOMUtils.remove(document.body || document, [
    'script',
    'style',
    'noscript',
    'link',
    'meta',
    'iframe#__framer-editorbar',
    '#svg-templates',
  ]);
  // inline SVG icons (arrows etc.) encoded as data: URIs are decoration, but the
  // data:image/svg+xml;base64 artwork created in beforeTransform (and copied into
  // block tables by the parsers) is content
  document.querySelectorAll('img[src^="data:"]').forEach((img) => {
    if ((img.getAttribute('src') || '').startsWith(SVG_DATA_PREFIX)) {
      img.removeAttribute('data-excat-svg');
      img.removeAttribute('data-excat-tile');
      return;
    }
    img.remove();
  });
  // leftover inline SVG decoration outside block tables (parsers already ran)
  document.querySelectorAll('svg').forEach((svg) => { if (!svg.closest('table')) svg.remove(); });
  // Framer / tracking attributes (keep data-excat-* markers for the section transformer)
  document.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const n = attr.name;
      if (n === 'data-excat-mask') { el.removeAttribute(n); return; }
      if (n.startsWith('data-excat-')) return;
      if (n.startsWith('data-framer') || n === 'data-border' || n === 'data-nosnippet') {
        el.removeAttribute(n);
      }
    });
  });
}

export default function transform(hookName, element, payload) {
  const document = (payload && payload.document) || element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    dedupeBreakpoints(document);
    inlineSvgArtwork(document);
    removeChrome(document);
    pillButtons(document);
    stripAppearStyles(document);
    unwrapCode(document);
    normaliseSplitText(document);
    applyContentFixes(document);
    normaliseHeadings(document);
    const template = payload && payload.template;
    if (!template || template.name !== 'homepage') scaleHeadings(document);
  }

  if (hookName === 'afterTransform') {
    videosToLinks(document);
    capFramerImages(document);
    finalCleanup(document);
  }
}
