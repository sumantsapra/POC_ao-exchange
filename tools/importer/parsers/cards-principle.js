/* eslint-disable */
/* global WebImporter */

/**
 * cards-principle (guideline-chapter writing principles, e.g. /tone-of-voice "Active verbs",
 * "Keep it short", "Bit of 'tude", "Aussie colour": painted text-only cards in a 2 x 2 grid).
 * Cards (no images) convention: one column, each row = one card:
 *   [<h3>title</h3><p>description</p>...].
 * Cards are the content children of the grid; Framer breakpoint copies are deduped by text.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

const TEXT = 'h1, h2, h3, h4, h5, h6, p';

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  [...element.children].filter((c) => textOf(c)).forEach((card) => {
    const nodes = [...card.querySelectorAll(TEXT)]
      .filter((n) => !n.parentElement.closest(TEXT) && textOf(n));
    const key = nodes.map(textOf).join(' / ').toLowerCase();
    if (!nodes.length || seen.has(key)) return;
    seen.add(key);
    const cell = nodes.map((n, i) => {
      const isTitle = i === 0 && (/^H[1-6]$/.test(n.tagName) || nodes.length > 1);
      const el = document.createElement(isTitle ? 'h3' : 'p');
      el.textContent = textOf(n);
      return el;
    });
    cells.push([cell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-principle', cells });
  element.replaceWith(block);
}
