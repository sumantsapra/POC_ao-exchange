/* eslint-disable */
/* global WebImporter */

/**
 * banner-overlay (/graphic-elements second "Divider full screen" band: a full-screen photo with
 * logo-pattern artwork laid over it).
 * Row 1: the background photo (the image covering the band; without a live layout, the image
 *   Framer serves at the full viewport width).
 * Row 2+: the artwork laid over it, in document order.
 * The block sizes and places the artwork (measured on the live page), so no option is needed.
 */
function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function area(img) {
  if (typeof img.getBoundingClientRect === 'function') {
    const r = img.getBoundingClientRect();
    if (r.width > 1 && r.height > 1) return r.width * r.height;
  }
  // no layout: Framer serves the band photo at the full viewport width (sizes "max(100vw, ...)")
  return /max\(100vw|^100vw/.test(img.getAttribute('sizes') || '') ? Infinity : 0;
}

export default function parse(element, { document }) {
  const seen = new Set();
  const sources = [...element.querySelectorAll('img')].filter((img) => {
    const src = imgSrc(img);
    if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seen.has(src)) return false;
    seen.add(src);
    return true;
  });
  if (!sources.length) return;
  const base = sources.reduce((a, b) => (area(b) > area(a) ? b : a), sources[0]);
  const ordered = [base, ...sources.filter((s) => s !== base)];
  const cells = ordered.map((source) => {
    const img = document.createElement('img');
    img.src = imgSrc(source);
    img.alt = source.getAttribute('alt') || '';
    return [img];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-overlay', cells });
  element.replaceWith(block);
}
