/* eslint-disable */
/* global WebImporter */

/**
 * cards-gradient (guideline-chapter colour gradients, e.g. /colour "AO Morning Gradient").
 * Each row: [h3 gradient name + <ul> of colour-stop names in order].
 * Tiles are found by structure: a wrapper with exactly two child groups, the first holding
 * one text element (the name), the second holding two or more single-text stops.
 * Framer breakpoint copies are deduped by name + stops.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

const TEXT = 'p, h1, h2, h3, h4, h5, h6';
const textEls = (el) => [...el.querySelectorAll(TEXT)].filter((t) => textOf(t) && !t.parentElement.closest(TEXT));
const titleCase = (t) => t.replace(/\b([a-z])/g, (m) => m.toUpperCase());

function isTile(el) {
  const kids = [...el.children].filter((c) => textOf(c));
  if (kids.length !== 2) return false;
  if (textEls(kids[0]).length !== 1) return false;
  const stops = [...kids[1].children].filter((c) => textOf(c));
  return stops.length >= 2 && stops.every((s) => textEls(s).length === 1);
}

export default function parse(element, { document }) {
  const tiles = [];
  element.querySelectorAll('*').forEach((el) => {
    if (tiles.some((t) => t.contains(el))) return;
    if (isTile(el)) tiles.push(el);
  });

  const cells = [];
  const seen = new Set();
  tiles.forEach((tile) => {
    const [nameGroup, stopGroup] = [...tile.children].filter((c) => textOf(c));
    const name = textOf(textEls(nameGroup)[0]);
    const stops = [...stopGroup.children].filter((c) => textOf(c)).map((s) => titleCase(textOf(s)));
    const key = `${name}|${stops.join('|')}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const h3 = document.createElement('h3');
    h3.textContent = name;
    const ul = document.createElement('ul');
    stops.forEach((stop) => {
      const li = document.createElement('li');
      li.textContent = stop;
      ul.append(li);
    });
    cells.push([[h3, ul]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gradient', cells });
  element.replaceWith(block);
}
