/* eslint-disable */
/* global WebImporter */

/**
 * columns-panel (sub-brand-guide image sets in a dark rounded panel, e.g. 3 masked
 * portraits or 5 posters on /ao-live).
 * One row, one cell per image, in document order, deduped by URL (Framer breakpoint copies).
 * Inline-vector artwork kept by the cleanup transformer (data:image/svg+xml images) counts as content.
 * Panel colour variant, from the live panel holding the images (nearest painted / Framer
 * data-border ancestor below the section band):
 *  - #0078ff panel -> "hits-different-blue" (/ao-shop elements)
 *  - white panel   -> "white" (/opening-week illustrations on the navy band; also the light
 *    grey panel behind a lone bitmap logo, /partner-guidelines composite logo)
 *  - no panel      -> "transparent" (/partner-guidelines AO Court images)
 *  - other colours (navy on /ao-live, /ao-reserve; #f8f8f8 on /logos) keep the default, which
 *    follows the section style.
 */
function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function parseRgb(value) {
  const m = (value || '').match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

/** Variant name for the panel behind the images, or '' (live browser only). */
function panelVariant(element, imgs) {
  const view = element.ownerDocument && element.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function' || !imgs.length) return '';
  let common = imgs[0].parentElement;
  while (common && !imgs.every((i) => common.contains(i))) common = common.parentElement;
  for (let n = common; n && n.nodeType === 1; n = n.parentElement) {
    if (n.tagName === 'SECTION' || n.tagName === 'MAIN' || n.tagName === 'BODY') return 'transparent';
    let rgb = null;
    try { rgb = parseRgb(view.getComputedStyle(n).backgroundColor); } catch (e) { rgb = null; }
    if (rgb) {
      if (Math.hypot(rgb[0], rgb[1] - 120, rgb[2] - 255) < 30) return 'hits-different-blue';
      if (rgb.every((c) => c >= 250)) return 'white';
      // light grey panel behind bitmap artwork (/partner-guidelines composite logo, #f8f8f8);
      // vector badge panels keep the default tinted panel
      const vector = imgs.some((i) => /^data:image\/svg\+xml|\.svg(\?|$)/.test(i.getAttribute('src') || ''));
      if (!vector && rgb.every((c) => c >= 240)) return 'white';
      return '';
    }
    if (n.getAttribute('data-border') === 'true') return ''; // outlined, unpainted panel
  }
  return '';
}

export default function parse(element, { document }) {
  const row = [];
  const seen = new Set();
  const sources = [];
  element.querySelectorAll('img').forEach((source) => {
    const src = imgSrc(source);
    if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seen.has(src)) return;
    seen.add(src);
    sources.push(source);
    const img = document.createElement('img');
    img.src = src;
    img.alt = source.getAttribute('alt') || '';
    row.push(img);
  });

  const cells = [row.length ? row : ['']];
  const variant = panelVariant(element, sources);
  const name = variant ? `columns-panel (${variant})` : 'columns-panel';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
