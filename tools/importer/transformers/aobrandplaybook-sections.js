/* eslint-disable */
/* global WebImporter */

/**
 * aobrandplaybook.com.au (Framer) section transformer.
 *
 * beforeTransform: insert <hr> section breaks while parser targets still exist.
 * afterTransform: add a Section Metadata block after each marked break.
 *
 * Matching:
 *  - mapped mode: every selector of payload.template.sections resolves to a
 *    distinct element in document order (the representative page of the
 *    template). Styles come from the template; homepage sections also get
 *    anchor + nav-label metadata.
 *  - structural fallback: Framer class hashes are per page and section ids
 *    (#color, #lookup-1, #safe-zones ...) are reused for different content, so
 *    on the other pages of a template every outermost <section> of the
 *    content column starts a section. Style is inferred from the content:
 *    media-only bands whose id family is full-width in the template, or whose
 *    images tile the full viewport width, get "full-width"; band colours are
 *    read from computed styles when available.
 */

const MARKER = 'data-excat-section-id';
const META_ATTR = 'data-excat-section-meta';

// Homepage left page-nav metadata (authoring-analysis.json sectionMetadata).
const HOMEPAGE_NAV_META = {
  '#intro': { anchor: 'intro', 'nav-label': 'Intro' },
  '#brand-positioning': { anchor: 'brand-positioning', 'nav-label': 'Who we are' },
  '#brandvoice': { anchor: 'brandvoice', 'nav-label': 'Brand values' },
  '#gamechangercomestolife': { anchor: 'bringing-it-to-life', 'nav-label': 'How it comes to life' },
  '#summary': { anchor: 'summary', 'nav-label': 'Toolkits' },
};

// Band colours -> section style names.
const PALETTE = [
  { style: 'royal-blue', rgb: [30, 40, 134] },
  { style: 'royal-blue', rgb: [33, 44, 144] },
  { style: 'bright-blue', rgb: [0, 176, 255] },
  { style: 'process-blue', rgb: [0, 145, 210] },
  { style: 'navy', rgb: [0, 12, 61] },
  { style: 'dark-navy', rgb: [15, 18, 66] },
  { style: 'hits-different-blue', rgb: [0, 120, 255] },
  { style: 'lime', rgb: [225, 255, 0] },
];

function findBySelectors(document, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector: try the next one
    }
  }
  return null;
}

function precedes(a, b) {
  // true when b comes after a in document order and is not inside a
  // eslint-disable-next-line no-bitwise
  return !!(a.compareDocumentPosition(b) & 4) && !a.contains(b);
}

function sectionMeta(template, section) {
  const meta = {};
  if (section.style) meta.style = section.style;
  if (template && template.name === 'homepage') {
    const list = Array.isArray(section.selector) ? section.selector : [section.selector];
    const key = list.find((s) => HOMEPAGE_NAV_META[s]);
    if (key) Object.assign(meta, HOMEPAGE_NAV_META[key]);
  }
  return meta;
}

function resolveMapped(document, sections) {
  const els = [];
  for (const section of sections) {
    const el = findBySelectors(document, section.selector);
    if (!el) return null;
    const prev = els[els.length - 1];
    if (prev && (!precedes(prev, el) || els.includes(el))) return null;
    els.push(el);
  }
  return els;
}

function idFamily(id) {
  return (id || '').replace(/-\d+$/, '');
}

function fullWidthFamilies(sections) {
  const families = new Set();
  sections.forEach((s) => {
    if (!s.style || !/full-width/.test(s.style)) return;
    const list = Array.isArray(s.selector) ? s.selector : [s.selector];
    list.forEach((sel) => {
      const m = (sel || '').match(/#([A-Za-z][\w-]*)/);
      if (m) families.add(idFamily(m[1]));
    });
  });
  return families;
}

function isMediaOnly(el) {
  return !!el.querySelector('img, video, picture, source')
    && !(el.textContent || '').replace(/\s+/g, '').length;
}

/**
 * Edge-to-edge image band (live browser only): the visible images of a media-only band tile the
 * full viewport width without overlapping, e.g. /graphic-elements "Divider full screen" 2 x 720
 * gallery and the 1440 "Application" photo. A logo laid over a band photo overlaps it, so such a
 * band is not treated as a gallery (its overlay would be stretched by the full-width style).
 */
function spansViewport(document, el) {
  const view = document.defaultView;
  const vw = document.documentElement && document.documentElement.clientWidth;
  if (!view || !vw || typeof el.getBoundingClientRect !== 'function') return false;
  const rects = [...el.querySelectorAll('img')]
    .map((img) => img.getBoundingClientRect())
    .filter((r) => r.width > 1 && r.height > 1);
  if (!rects.length) return false;
  const overlaps = rects.some((a, i) => rects.some((b, j) => j > i
    && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2
    && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2));
  if (overlaps) return false;
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  return left <= 2 && right >= vw - 2;
}

function parseRgb(value) {
  const m = (value || '').match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

// first opaque colour stop of a linear-gradient band (e.g. tone-of-voice process-blue fade)
function gradientRgb(value) {
  if (!/linear-gradient/.test(value || '')) return null;
  const stops = (value.match(/rgba?\([^)]*\)/g) || []).map(parseRgb).filter(Boolean);
  return stops[0] || null;
}

function paletteStyle(rgb) {
  let best = null;
  PALETTE.forEach((p) => {
    const d = Math.hypot(rgb[0] - p.rgb[0], rgb[1] - p.rgb[1], rgb[2] - p.rgb[2]);
    if (d < 40 && (!best || d < best.d)) best = { d, style: p.style };
  });
  return best ? best.style : null;
}

/**
 * Band colour: the band's own paint (or that of its single-child wrappers), else, when
 * `inherit` is set, the paint of the nearest painted ancestor wrapper below #main: Framer paints
 * some sub-brand pages on a page wrapper (/ao-reserve dark navy behind the hero-to-logos
 * sections, /partner-guidelines navy behind the whole page), which only section styles can
 * carry over. A light / white wrapper ends the search (no style).
 */
function bandStyle(document, el, inherit = false) {
  const view = document.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return null;
  const hasText = !!(el.textContent || '').replace(/\s+/g, '').length;
  let node = el;
  for (let depth = 0; node && depth < 3; depth += 1) {
    let rgb = null;
    try {
      const cs = view.getComputedStyle(node);
      rgb = parseRgb(cs.backgroundColor) || (hasText ? gradientRgb(cs.backgroundImage) : null);
    } catch (e) {
      rgb = null;
    }
    if (rgb) return paletteStyle(rgb);
    node = node.children.length === 1 ? node.children[0] : null;
  }
  if (!inherit) return null;
  for (let n = el.parentElement; n && n.id !== 'main' && n.tagName !== 'BODY'; n = n.parentElement) {
    let rgb = null;
    try { rgb = parseRgb(view.getComputedStyle(n).backgroundColor); } catch (e) { rgb = null; }
    if (rgb) return paletteStyle(rgb);
  }
  return null;
}

/**
 * Centred text band (live browser only): every visible outermost text element of the band has
 * its text centred on the band's content box (padding excluded), e.g. /tone-of-voice
 * "Manifesto" and "Playful <-> Premium". Measured on the text itself (Range box), so a
 * left-aligned heading above centred tiles keeps the band left-aligned.
 */
const TEXT_SEL = 'h1, h2, h3, h4, h5, h6, p, li';

function isCenteredBand(document, el) {
  const view = document.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function' || typeof document.createRange !== 'function'
    || typeof el.getBoundingClientRect !== 'function') return false;
  const box = el.getBoundingClientRect();
  if (!box.width) return false;
  const cs = view.getComputedStyle(el);
  const mid = (box.left + (parseFloat(cs.paddingLeft) || 0) + box.right - (parseFloat(cs.paddingRight) || 0)) / 2;
  const texts = [...el.querySelectorAll(TEXT_SEL)]
    .filter((t) => (t.textContent || '').trim() && !t.parentElement.closest(TEXT_SEL));
  let measured = 0;
  const ok = texts.every((t) => {
    const range = document.createRange();
    range.selectNodeContents(t);
    const r = range.getBoundingClientRect();
    if (!r.width || !r.height) return true; // hidden copy
    measured += 1;
    return Math.abs((r.left + r.right) / 2 - mid) <= 24;
  });
  return ok && measured > 0;
}

function resolveStructural(document, sections) {
  const root = document.querySelector('#main') || document.body;
  const all = [...root.querySelectorAll('section')]
    .filter((s) => !s.parentElement.closest('section'))
    .filter((s) => !s.closest('header, nav, footer'));
  const families = fullWidthFamilies(sections);
  return all.map((el, i) => {
    const styles = [];
    // a media-only first band (sub-brand hero) keeps no inherited page colour: it is
    // full-bleed media; a hero with its title (/partner-guidelines) sits on the page colour
    const band = bandStyle(document, el, i > 0 || !isMediaOnly(el));
    if (band) styles.push(band);
    // full-width: media-only band whose id family is full-width in the template, or an image-only
    // band whose images run edge to edge on the live page (video bands such as the sub-brand hero
    // and intro animations are blocks with their own layout)
    if (isMediaOnly(el) && ((el.id && families.has(idFamily(el.id)))
      || (!el.querySelector('video') && spansViewport(document, el)))) styles.push('full-width');
    if (isCenteredBand(document, el)) styles.push('centered');
    const meta = {};
    if (styles.length) meta.style = styles.join(', ');
    return { el, meta, id: `structural-${i + 1}` };
  });
}

function insertBreaks(document, entries) {
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const { el, meta, id } = entries[i];
    const hasMeta = Object.keys(meta).length > 0;
    if (i === 0 && !hasMeta) continue;
    const hr = document.createElement('hr');
    if (hasMeta) {
      hr.setAttribute(MARKER, i === 0 ? `${id}:first` : id);
      hr.setAttribute(META_ATTR, JSON.stringify(meta));
    }
    el.before(hr);
  }
}

export default function transform(hookName, element, payload) {
  const document = (payload && payload.document) || element.ownerDocument || element;
  const template = payload && payload.template;
  const sections = (template && template.sections) || [];

  if (hookName === 'beforeTransform') {
    if (!sections.length) return;
    let entries;
    const mapped = resolveMapped(document, sections);
    if (mapped) {
      entries = mapped.map((el, i) => ({
        el,
        meta: sectionMeta(template, sections[i]),
        id: sections[i].id || `section-${i + 1}`,
      }));
    } else {
      entries = resolveStructural(document, sections);
    }
    if (entries.length < 2 && !(entries[0] && Object.keys(entries[0].meta).length)) return;
    insertBreaks(document, entries);
  }

  if (hookName === 'afterTransform') {
    const markers = [...document.querySelectorAll(`hr[${MARKER}]`)].reverse();
    markers.forEach((hr) => {
      const isFirst = /:first$/.test(hr.getAttribute(MARKER) || '');
      let meta = {};
      try {
        meta = JSON.parse(hr.getAttribute(META_ATTR) || '{}');
      } catch (e) {
        meta = {};
      }
      if (Object.keys(meta).length) {
        const block = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: meta,
        });
        hr.after(block);
      }
      hr.removeAttribute(MARKER);
      hr.removeAttribute(META_ATTR);
      if (isFirst) hr.remove();
    });
  }
}
