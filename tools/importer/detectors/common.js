/* eslint-disable */
/* global WebImporter */

/**
 * Shared structure-based block detection for aobrandplaybook.com.au (Framer).
 *
 * Framer class hashes (framer-xxxx) are generated per page and section ids
 * (#color, #lookup-1, #safe-zones ...) are reused across pages for different
 * content, so the instance selectors in page-templates.json only hold on the
 * representative page of a template. These helpers find block candidates by
 * DOM structure instead. They run after the beforeTransform cleanup (desktop
 * breakpoint duplicates and chrome are already removed) and never modify the DOM.
 *
 * A template detector module exports an ordered list of
 *   { name, test(el, ctx) -> boolean, validate?(el) -> boolean }
 * `test` decides whether `el` is the container of one block instance; it is
 * called on every element in document order, outermost first, and an element
 * inside an already matched block is never tested again. `validate` is a
 * looser check used to accept a mapped instance selector match.
 */

export const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const TEXT_SEL = 'h1, h2, h3, h4, h5, h6, p, li';
const NOISE_RE = /^copy( hex| to clipboard)?$/i;

export function textOf(el) {
  if (!el) return '';
  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

/** Text without Framer copy-to-clipboard control labels. */
export function cleanText(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('button').forEach((b) => b.remove());
  clone.querySelectorAll('p').forEach((p) => { if (NOISE_RE.test(textOf(p))) p.remove(); });
  return textOf(clone);
}

export function contentImages(el) {
  if (!el) return [];
  const imgs = el.tagName === 'IMG' ? [el] : [...el.querySelectorAll('img')];
  return imgs.filter((img) => {
    const src = img.getAttribute('src') || '';
    // data:image/svg+xml = inline-vector artwork kept by the cleanup transformer
    return src && (!src.startsWith('data:') || src.startsWith('data:image/svg+xml'));
  });
}

export function videos(el) {
  if (!el) return [];
  return el.tagName === 'VIDEO' ? [el] : [...el.querySelectorAll('video')];
}

export function headings(el) {
  return [...el.querySelectorAll(HEADINGS)].filter((h) => textOf(h) && !NOISE_RE.test(textOf(h)));
}

/** Leaf text elements (outermost h1-h6 / p / li with text). */
export function textElements(el) {
  return [...el.querySelectorAll(TEXT_SEL)]
    .filter((t) => textOf(t) && !NOISE_RE.test(textOf(t)) && !t.closest('button'))
    .filter((t) => !t.parentElement.closest(TEXT_SEL));
}

export function hasContent(el) {
  if (!el || el.tagName === 'HR' || el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return false;
  return !!textOf(el) || contentImages(el).length > 0 || videos(el).length > 0;
}

/** Element children carrying text or media (Framer inserts empty layout divs). */
export function contentChildren(el) {
  return [...el.children].filter(hasContent);
}

export function isMediaOnly(el) {
  return !textOf(el) && (contentImages(el).length > 0 || videos(el).length > 0);
}

/** One image, no text, no video. */
export function isImageTile(el) {
  return !textOf(el) && videos(el).length === 0 && contentImages(el).length === 1;
}

/** One image plus at most one short label (e.g. "Mono Logo"). */
export function isLabelledImageTile(el, maxWords = 6) {
  if (videos(el).length || contentImages(el).length !== 1) return false;
  const texts = textElements(el);
  if (texts.length > 1) return false;
  const t = cleanText(el);
  return !t || t.split(' ').length <= maxWords;
}

/** Container whose content children are all image-only tiles (>= min). */
export function isImageGrid(el, min = 2) {
  const kids = contentChildren(el);
  if (kids.length < min) return false;
  if (kids.every(isImageTile)) return true;
  // rows of image tiles (e.g. a 2 x 2 set built as two rows) form one grid
  return kids.every((k) => {
    const row = contentChildren(k);
    return row.length >= 2 && row.every(isImageTile);
  });
}

/**
 * Intrinsic image facts from Framer <img width height sizes srcset style="object-fit">.
 * displayWidth is the desktop (min-width: 1200px) width from `sizes`: a fixed px value,
 * Infinity for fluid (vw-based) images, or the intrinsic width when there is no `sizes`.
 */
export function imageInfo(img) {
  const w = parseInt(img.getAttribute('width') || '0', 10) || 0;
  const h = parseInt(img.getAttribute('height') || '0', 10) || 0;
  const style = img.getAttribute('style') || '';
  // inline-vector artwork (data:image/svg+xml from the cleanup transformer) is contained artwork
  const svgArt = (img.getAttribute('src') || '').startsWith('data:image/svg+xml');
  const fit = svgArt ? 'contain' : ((style.match(/object-fit\s*:\s*([a-z-]+)/i) || [])[1] || '');
  const sizes = img.getAttribute('sizes') || '';
  const desktop = (sizes.match(/\(min-width:\s*1200px\)\s*([^,]+(?:\([^)]*\))*[^,]*)/) || [])[1] || sizes;
  let displayWidth = w;
  if (sizes) {
    const px = desktop.trim().match(/^([\d.]+)px$/);
    displayWidth = px ? parseFloat(px[1]) : Infinity;
  }
  return {
    w,
    h,
    fit: fit.toLowerCase(),
    fullBleed: /^max\(100vw|^100vw/.test(desktop.trim()),
    responsive: !!(sizes || img.getAttribute('srcset')),
    displayWidth,
  };
}

/** Cropped to its frame (object-fit cover / fill), i.e. not contained artwork. */
export function isCropped(img) {
  return imageInfo(img).fit !== 'contain';
}

/**
 * A photo: cropped to its frame, served responsively (Framer emits sizes / srcset for
 * large bitmaps) and shown at least 200px wide. Icon / sticker tiles (110-120px) are not photos.
 */
export function isPhoto(img) {
  const { fit, responsive, displayWidth } = imageInfo(img);
  return fit !== 'contain' && responsive && displayWidth >= 200;
}

/** Small graphic (icon / shape / sticker): contained artwork, shown at most 200px wide, or a small non-responsive bitmap. */
export function isGraphic(img, maxSide = 600) {
  const { w, h, fit, displayWidth } = imageInfo(img);
  const { responsive } = imageInfo(img);
  return (fit === 'contain' && Math.max(w, h) <= maxSide) || displayWidth <= 200
    || (!responsive && Math.max(w, h) <= 400);
}

/** Photos of one row are either all full-bleed or none (a logo overlaid on a band photo is not a row). */
export function uniformBleed(imgs) {
  const bleed = imgs.filter((i) => imageInfo(i).fullBleed).length;
  return bleed === 0 || bleed === imgs.length;
}

/** Outermost content <section> holding el. */
export function bandOf(el) {
  let band = el.closest('section');
  while (band && band.parentElement && band.parentElement.closest('section')) {
    band = band.parentElement.closest('section');
  }
  return band;
}

/**
 * Full-bleed media band: the innermost section holding el carries only media
 * (no text), e.g. "Divider full screen" / "Brand moment" photo bands.
 */
export function inMediaOnlyBand(el) {
  const section = el.closest('section');
  return !!section && isMediaOnly(section);
}

/** data-framer-name layer names from el up to its outermost section. */
export function layerNames(el, root) {
  const names = [];
  for (let n = el; n && n !== root; n = n.parentElement) {
    const name = n.getAttribute && n.getAttribute('data-framer-name');
    if (name) names.push(name);
    if (n.tagName === 'SECTION' && !n.parentElement.closest('section')) break;
  }
  return names;
}

// eslint-disable-next-line no-bitwise
const isBefore = (a, b) => !!(a.compareDocumentPosition(b) & 4);

/** Nearest heading before el in document order (not inside el). */
export function previousHeading(el, ctx) {
  let found = null;
  for (const h of ctx.headings) {
    if (el.contains(h)) break;
    if (isBefore(h, el)) found = h;
    else break;
  }
  return found;
}

/**
 * Context words for an element: the nearest previous heading, plus the layer
 * names of its ancestors up to the band. Used to tell image grids apart
 * (logos vs shapes vs photos) when the structure is the same.
 */
export function contextOf(el, ctx) {
  const h = previousHeading(el, ctx);
  return {
    heading: h ? textOf(h) : '',
    layers: layerNames(el, ctx.root).join(' | '),
  };
}

export function buildContext(document) {
  const root = document.querySelector('#main') || document.body;
  const ctx = { document, root, headings: headings(root) };
  return ctx;
}

/**
 * Walk root in document order, outermost first, and return the detected
 * block containers. Subtrees of matched elements (and of seeds, i.e. mapped
 * selector matches) are never tested again, so nested candidates cannot be
 * matched twice; an element that contains a seed is not tested either.
 */
export function detect(document, detectors, seeds = []) {
  const ctx = buildContext(document);
  const found = [];
  const seedEls = seeds.map((s) => s.element);

  const visit = (el) => {
    if (seedEls.includes(el)) return;
    if (/^(SCRIPT|STYLE|SVG|HR|IMG|VIDEO|BUTTON|P|H[1-6])$/i.test(el.tagName)) return;
    const holdsSeed = seedEls.some((s) => el.contains(s));
    if (!holdsSeed && hasContent(el)) {
      for (const det of detectors) {
        let ok = false;
        try { ok = det.test(el, ctx); } catch (e) { ok = false; }
        if (ok) {
          // narrow through single-child wrappers the detector still accepts
          let target = el;
          for (;;) {
            const kids = contentChildren(target);
            if (kids.length !== 1) break;
            let inner = false;
            try { inner = det.test(kids[0], ctx); } catch (e) { inner = false; }
            if (!inner) break;
            [target] = kids;
          }
          found.push({ name: det.name, element: target, selector: `structural:${det.name}`, source: 'fallback' });
          return;
        }
      }
    }
    [...el.children].forEach(visit);
  };
  [...ctx.root.children].forEach(visit);

  return found;
}

export function sortByDocumentOrder(list) {
  return list.sort((a, b) => {
    if (a.element === b.element) return 0;
    return isBefore(a.element, b.element) ? -1 : 1;
  });
}

/* ------------------------------------------------------------------ */
/* Block structures shared by both templates                           */
/* ------------------------------------------------------------------ */

const LABEL_RE = /^(hex|rgb|cmyk|pms|pantone)\s*:?/i;

/** Swatch tile: the shared Framer swatch component, or one heading + Hex/RGB/CMYK/PMS labels. */
export function isSwatchTile(el) {
  if (el.classList && el.classList.contains('framer-KY4CI')) return true;
  const hs = headings(el);
  if (hs.length !== 1) return false;
  const labels = [...el.querySelectorAll('p')].filter((p) => LABEL_RE.test(textOf(p)));
  return labels.length >= 1; // e.g. court colours carry only a PMS value
}

/** Special-finish style tile: one heading over an image, no colour values. */
function isImageNameTile(el) {
  const hs = headings(el);
  if (hs.length !== 1 || contentImages(el).length < 1) return false;
  return !el.querySelector('p') || [...el.querySelectorAll('p')].every((p) => !LABEL_RE.test(textOf(p)) && NOISE_RE.test(textOf(p)));
}

/** Short usage note sitting with the tiles (e.g. Ruby Red cultural note). */
function isNote(el) {
  return !headings(el).length && !contentImages(el).length && textElements(el).length >= 1;
}

/**
 * cards-swatch container: every content child is a swatch tile, wraps swatch
 * tiles (optionally with a usage note) or is a special-finish image tile.
 * A palette title (heading without values) rejects the element, so the
 * container is the tile grid, not the palette column.
 */
export function isSwatchGrid(el) {
  if (isSwatchTile(el)) return false;
  const kids = contentChildren(el);
  if (!kids.length) return false;
  let swatches = 0;
  const ok = kids.every((k) => {
    if (isSwatchTile(k)) { swatches += 1; return true; }
    if (isImageNameTile(k)) return true;
    // tile wrapper: swatch tile(s) plus an optional usage note, nothing else
    const inner = contentChildren(k);
    if (inner.some(isSwatchTile) && inner.every((c) => isSwatchTile(c) || isNote(c))) {
      swatches += 1;
      return true;
    }
    return false;
  });
  return ok && swatches >= 1;
}

const CONTRAST_RE = /^\S{0,4}\s*background\s*:?\s*\S.*\btext\s*:?\s*\S/i;

export function isContrastTile(el) {
  const t = textOf(el).replace(/(background|text)/gi, ' $1 ').replace(/\s+/g, ' ').trim();
  if (!CONTRAST_RE.test(t) || contentImages(el).length) return false;
  if (t.split(' ').length > 14) return false;
  // exactly one caption paragraph ("Background X Text Y") per tile
  return [...el.querySelectorAll('p')].filter((p) => /^background/i.test(textOf(p))).length === 1;
}

/** cards-contrast container: all content children are "Aa / Background X / Text Y" tiles. */
export function isContrastGrid(el) {
  const kids = contentChildren(el);
  return kids.length >= 1 && kids.every(isContrastTile) && !isContrastTile(el);
}

/** Video container: one video, no text, no other media; outermost such wrapper below its section. */
export function isVideoContainer(el) {
  if (el.tagName === 'SECTION') return false;
  if (textOf(el) || videos(el).length !== 1 || contentImages(el).length > 0) return false;
  const parent = el.parentElement;
  if (!parent || parent.tagName === 'SECTION') return true;
  return !!textOf(parent) || videos(parent).length !== 1 || contentImages(parent).length > 0;
}

/** Outermost media-only wrapper of a media element, staying inside its section. */
export function mediaWrapper(media, root) {
  let node = media;
  while (node.parentElement && node.parentElement !== root && node.parentElement.tagName !== 'SECTION') {
    const p = node.parentElement;
    if (textOf(p) || contentImages(p).length + videos(p).length > 1) break;
    node = p;
  }
  return node;
}

// glyph line: "1234&%#@"-style sample, or a run of 4+ CJK characters ("官 方 合 作 伙 伴")
const GLYPH_RE = /\d{4}\S{0,10}[&%#@]|(?:[\u3400-\u9fff]\s*){4,}/;

function glyphLines(el) {
  return [...el.querySelectorAll('p')].filter((p) => GLYPH_RE.test(textOf(p)));
}

/** Font specimen box: font name + glyph line (+ weight names), no heading. */
export function isSpecimen(el) {
  return glyphLines(el).length === 1 && !headings(el).length && textOf(el).length <= 220
    && !contentImages(el).length;
}

/**
 * columns-typeface row: [specimen | copy column], or a lone
 * specimen that is not part of such a row.
 */
export function isTypefaceRow(el) {
  if (videos(el).length || contentImages(el).length) return false;
  const kids = contentChildren(el);
  if (kids.length === 2 && glyphLines(el).length === 1) {
    const spec = kids.find(isSpecimen);
    const copy = kids.find((k) => k !== spec);
    if (spec && copy && textElements(copy).length >= 1 && !glyphLines(copy).length) return true;
  }
  if (isSpecimen(el)) {
    const parent = el.parentElement;
    return !(parent && isTypefaceRowShape(parent));
  }
  return false;
}

function isTypefaceRowShape(el) {
  const kids = contentChildren(el);
  if (kids.length !== 2 || glyphLines(el).length !== 1) return false;
  const spec = kids.find(isSpecimen);
  const copy = kids.find((k) => k !== spec);
  return !!(spec && copy && textElements(copy).length >= 1);
}

/* ------------------------------------------------------------------ */
/* Framed artwork, misuse grids, logo-on-colour accessibility tiles    */
/* ------------------------------------------------------------------ */

/** Main flex direction of an element ('row' / 'column' / ''), from computed style. */
export function flexDirection(el) {
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return '';
  let cs = null;
  try { cs = view.getComputedStyle(el); } catch (e) { return ''; }
  // jsdom only keeps the Framer `flex-flow` shorthand; browsers expose flexDirection too
  const flow = (cs.getPropertyValue('flex-flow') || '').trim().split(/\s+/)[0];
  if (/^(row|column)/.test(flow)) return flow.replace('-reverse', '');
  if (/^(wrap|nowrap|wrap-reverse)$/.test(flow)) return 'row';
  const dir = (cs.flexDirection || '').replace('-reverse', '');
  return cs.display && /flex/.test(cs.display) ? dir || 'row' : '';
}

/** Largest content image of an element (artwork rather than a caption icon). */
export function mainImage(el) {
  const area = (img) => (parseFloat(img.getAttribute('width')) || 1) * (parseFloat(img.getAttribute('height')) || 1);
  return contentImages(el).sort((a, b) => area(b) - area(a))[0] || null;
}

const MISUSE_RE = /^(don['’]?t|do not|never|avoid)\b/i;

/** cards-misuse: tiles of example image + "Don't …" caption (caption icons allowed). */
export function isMisuseGrid(el) {
  const kids = contentChildren(el);
  if (kids.length < 2) return false;
  return kids.every((k) => {
    const texts = textElements(k);
    return contentImages(k).length >= 1 && contentImages(k).length <= 3 && texts.length >= 1
      && MISUSE_RE.test(textOf(texts[0])) && textOf(k).split(' ').length <= 30 && !videos(k).length;
  });
}

/**
 * Artwork tile with text: one artwork image (plus at most a small icon) and a title and/or
 * description, e.g. [frame image | title + description] or [title | frame image | text].
 * Returns { image part, text nodes } or null.
 */
export function artworkTextTile(el) {
  if (videos(el).length) return null;
  const imgs = contentImages(el);
  if (imgs.length !== 1) return null;
  const texts = textElements(el);
  if (!texts.length || MISUSE_RE.test(textOf(texts[0]))) return null;
  if (textOf(el).split(' ').length > 120) return null;
  return { img: imgs[0], texts };
}

/** [image part | text part] with the parts side by side (flex row) = a one-per-row layout. */
export function isSideBySide(el) {
  const kids = contentChildren(el);
  if (kids.length !== 2) return false;
  const img = kids.find((k) => isImageTile(k));
  const text = kids.find((k) => k !== img);
  if (!img || !text || contentImages(text).length || !textElements(text).length) return false;
  return flexDirection(el) === 'row';
}

/**
 * cards-framed grid of artwork + text tiles: 2-6 tiles laid out as cards (image above text),
 * not one-per-row rows (those are columns-text-image) and not short-label logo tiles (cards-logo).
 */
export function isFramedTextGrid(el) {
  const kids = contentChildren(el);
  if (kids.length < 2 || kids.length > 6) return false;
  return kids.every((k) => {
    const tile = artworkTextTile(k);
    if (!tile || isSideBySide(k)) return false;
    // a short label alone (e.g. "Reverse Logo") is a logo-version tile, not a framed card
    return tile.texts.length >= 2 || textOf(k).split(' ').length > 6;
  });
}

/** Accessibility grid of logo-on-colour squares: text-less tiles of 1-2 vector images. */
export function isLogoContrastGrid(el, ctx) {
  const kids = contentChildren(el);
  if (kids.length < 4) return false;
  const ok = kids.every((k) => !textOf(k) && contentImages(k).length >= 1 && contentImages(k).length <= 2
    && contentImages(k).every((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml')));
  if (!ok) return false;
  const { heading } = contextOf(el, ctx);
  return /accessib|contrast|pairing/i.test(heading);
}

export const EXCLUSION_RE = /exclusion|minimum size|clear ?space|safe ?zone/i;
export const LOCKUP_RE = /logo|wordmark|lock-?up|designation|marque/i;

/**
 * cards-framed: a grid of artwork + text cards (isFramedTextGrid), or 2-3 text-less artwork
 * frames under an exclusion-zone / minimum-size heading, or (when `lockups`) 2-3 contained
 * logo artworks (vector / contained images, not photos) under a logo / wordmark heading.
 */
export function isFramedGrid(el, ctx, { lockups = false } = {}) {
  if (isFramedTextGrid(el)) return true;
  if (!isImageGrid(el)) return false;
  const imgs = contentImages(el);
  if (imgs.length < 2 || imgs.length > 3) return false;
  const { heading } = contextOf(el, ctx);
  if (EXCLUSION_RE.test(heading)) return true;
  return lockups && LOCKUP_RE.test(heading) && imgs.every((i) => !isCropped(i));
}
