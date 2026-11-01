/* eslint-disable */
/* global WebImporter */

/**
 * cards-mosaic (homepage #test-2-nav #grid).
 * Each row: [photo | empty text cell]. Every content image of the grid, in document order,
 * deduped by image URL (Framer breakpoint copies).
 */
function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  element.querySelectorAll('img').forEach((source) => {
    const src = imgSrc(source);
    if (!src || src.startsWith('data:') || seen.has(src)) return;
    seen.add(src);
    const img = document.createElement('img');
    img.src = src;
    img.alt = source.getAttribute('alt') || '';
    cells.push([img, '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-mosaic', cells });
  element.replaceWith(block);
}
