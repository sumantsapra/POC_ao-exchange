/* eslint-disable */
/* global WebImporter */

/**
 * cards-shape (sub-brand-guide graphic shape icons grid).
 * Each row: [shape image | optional shape name (empty on /ao-live)].
 * Shapes = every content image in document order, deduped by URL (Framer breakpoint copies);
 * a name is any text inside the image's own tile wrapper.
 * Inline-vector artwork kept by the cleanup transformer (data:image/svg+xml images) counts as content.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function tileOf(img, root) {
  let node = img;
  while (node.parentElement && node.parentElement !== root
    && node.parentElement.querySelectorAll('img:not([src^="data:"]), img[src^="data:image/svg+xml"]').length === 1) {
    node = node.parentElement;
  }
  return node;
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  element.querySelectorAll('img').forEach((source) => {
    const src = imgSrc(source);
    if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seen.has(src)) return;
    seen.add(src);
    const img = document.createElement('img');
    img.src = src;
    img.alt = source.getAttribute('alt') || '';
    const name = textOf(tileOf(source, element));
    let textCell = '';
    if (name) {
      textCell = document.createElement('p');
      textCell.textContent = name;
    }
    cells.push([img, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-shape', cells });
  element.replaceWith(block);
}
