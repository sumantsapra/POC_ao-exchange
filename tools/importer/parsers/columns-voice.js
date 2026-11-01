/* eslint-disable */
/* global WebImporter */

/**
 * columns-voice (guideline-chapter tone scale usage examples, /tone-of-voice "Usage examples").
 * Columns convention: every row has the same 3 cells, one row per example:
 *   [label (e.g. "Tournament announcement") | first tile | second tile].
 * A tile cell is [<h3>tile label ("Playful")</h3><p>quote</p>]. The block paints the first tile
 * of a row process blue (playful end of the scale) and the second navy (premium end).
 * Text before the examples inside the container (the "Usage examples" heading) stays default
 * content before the block. An example without a label gets an empty first cell.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

const TEXT = 'h1, h2, h3, h4, h5, h6, p';
const HEADING_RE = /^H[1-6]$/;
const kids = (el) => [...el.children].filter((c) => textOf(c));
const textNodes = (el) => [...el.querySelectorAll(TEXT)].filter((n) => !n.parentElement.closest(TEXT) && textOf(n));

/** [tile, tile] pair: two children each holding a heading and a quote. */
function isPair(el) {
  const k = kids(el);
  return k.length === 2 && k.every((t) => textNodes(t).length >= 2 && t.querySelector('h1, h2, h3, h4, h5, h6'));
}

function pairOf(example) {
  let node = example;
  for (let i = 0; i < 4 && node; i += 1) {
    if (isPair(node)) return node;
    const k = kids(node);
    node = k.length === 1 ? k[0] : k.find(isPair) || null;
  }
  return null;
}

function tileCell(document, tile) {
  return textNodes(tile).map((n, i) => {
    const el = document.createElement(i === 0 ? 'h3' : 'p');
    el.textContent = textOf(n);
    return el;
  });
}

export default function parse(element, { document }) {
  const cells = [];
  const before = [];
  kids(element).forEach((child) => {
    const pair = pairOf(child);
    if (!pair) {
      if (!cells.length) before.push(child);
      return;
    }
    const labelNodes = textNodes(child).filter((n) => !pair.contains(n));
    let label = '';
    if (labelNodes.length) {
      label = document.createElement('p');
      label.textContent = labelNodes.map(textOf).join(' ');
    }
    const [a, b] = kids(pair);
    cells.push([label, tileCell(document, a), tileCell(document, b)]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-voice', cells });
  // leading text (e.g. the "Usage examples" heading) stays default content before the block
  before.forEach((child) => {
    const nodes = /^(P|H[1-6])$/.test(child.tagName) ? [child] : textNodes(child);
    nodes.forEach((n) => {
      const el = document.createElement(HEADING_RE.test(n.tagName) ? n.tagName.toLowerCase() : 'p');
      el.textContent = textOf(n);
      element.before(el);
    });
  });
  element.replaceWith(block);
}
