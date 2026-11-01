/* eslint-disable */
/* global WebImporter */

/**
 * columns-tiles (homepage #howeplay).
 * One row, one cell per tile: [logo image + label paragraph]. No links.
 * Tiles are the smallest wrappers holding exactly one content image and a text label,
 * deduped by image URL (Framer breakpoint copies).
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

function sentenceCase(text) {
  const t = text.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function parse(element, { document }) {
  const imgs = [...element.querySelectorAll('img')]
    .filter((img) => !(img.getAttribute('src') || '').startsWith('data:'));
  const seen = new Set();
  const row = [];
  imgs.forEach((source) => {
    const src = imgSrc(source);
    if (seen.has(src)) return;
    seen.add(src);
    // tile = climb from the image until the wrapper has a text label
    let tile = source.parentElement;
    while (tile && tile !== element && !textOf(tile)) tile = tile.parentElement;
    const cell = [];
    const img = document.createElement('img');
    img.src = src;
    img.alt = source.getAttribute('alt') || '';
    cell.push(img);
    const labelEl = tile && tile !== element
      ? [...tile.querySelectorAll('p, h1, h2, h3, h4, h5, h6')].find((p) => textOf(p))
      : null;
    if (labelEl) {
      const p = document.createElement('p');
      p.textContent = sentenceCase(textOf(labelEl));
      cell.push(p);
    }
    row.push(cell);
  });

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-tiles', cells });
  element.replaceWith(block);
}
