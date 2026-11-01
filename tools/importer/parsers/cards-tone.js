/* eslint-disable */
/* global WebImporter */

/**
 * cards-tone (sub-brand-guide tone-of-voice tiles, e.g. "SOUNDS LIKE SUNSCREEN AND SUBWOOFERS").
 * Each row = one tile: [one paragraph per line of the tile]. A tile is a content child of the
 * tile grid (single-child wrappers are descended first), so two- or three-line tiles such as
 * /opening-week "FIRST CHEERS" + "ALL FOOD & BARS OPEN" stay one card.
 * Tiles repeated by Framer breakpoint copies are deduped by their text. Text is kept as written.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

const TEXT = 'p, h1, h2, h3, h4, h5, h6';
const withText = (el) => [...el.children].filter((c) => textOf(c));

function linesOf(tile) {
  const lines = [...tile.querySelectorAll(TEXT)]
    .filter((n) => !n.parentElement.closest(TEXT))
    .map(textOf)
    .filter(Boolean);
  return lines.length ? lines : [textOf(tile)].filter(Boolean);
}

export default function parse(element, { document }) {
  // the tile grid: descend through single-child wrappers
  let grid = element;
  while (withText(grid).length === 1 && withText(withText(grid)[0]).length >= 1
    && !/^(P|H[1-6])$/.test(withText(grid)[0].tagName)) {
    [grid] = withText(grid);
  }
  let tiles = withText(grid);
  // a grid made only of text elements (no tile wrappers): each element is a tile
  if (!tiles.length) tiles = [grid];

  const cells = [];
  const seen = new Set();
  tiles.forEach((tile) => {
    const lines = linesOf(tile);
    const key = lines.join(' / ').toLowerCase();
    if (!lines.length || seen.has(key)) return;
    seen.add(key);
    const cell = lines.map((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      return p;
    });
    cells.push([cell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tone', cells });
  element.replaceWith(block);
}
