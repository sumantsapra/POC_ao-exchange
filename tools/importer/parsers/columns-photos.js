/* eslint-disable */
/* global WebImporter */

/**
 * columns-photos (guideline-chapter and sub-brand-guide photo pairs / grids).
 * One cell per photo, every row the same cell count:
 *   2-3 photos -> one row; 4 photos -> 2 x 2 (as on /ao-live); more -> rows of 3, last row padded.
 * Photos are every content image in document order, deduped by URL (Framer breakpoint copies).
 * Inline-vector artwork kept by the cleanup transformer (data:image/svg+xml images) counts as content.
 */
function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

export default function parse(element, { document }) {
  const seen = new Set();
  const photos = [];
  element.querySelectorAll('img').forEach((source) => {
    const src = imgSrc(source);
    if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seen.has(src)) return;
    seen.add(src);
    const img = document.createElement('img');
    img.src = src;
    img.alt = source.getAttribute('alt') || '';
    photos.push(img);
  });

  let perRow = photos.length;
  if (photos.length === 4) perRow = 2;
  else if (photos.length > 4) perRow = 3;

  const cells = [];
  for (let i = 0; i < photos.length; i += perRow) {
    const row = photos.slice(i, i + perRow);
    while (row.length < perRow) row.push('');
    cells.push(row);
  }
  if (!cells.length) cells.push(['']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-photos', cells });
  element.replaceWith(block);
}
