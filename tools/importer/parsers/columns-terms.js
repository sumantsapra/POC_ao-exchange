/* eslint-disable */
/* global WebImporter */

/**
 * columns-terms (guideline-chapter term lists in a panel, /tone-of-voice).
 * Columns convention: one row, one cell per column; each cell holds a list of terms.
 *  - "Editorial style guide": a grid of [term | tick or cross icon] cells. Each column becomes
 *    one cell starting with the authorable line "Correct" (tick) or "Incorrect" (cross) that the
 *    block reads and hides, then <ul> of the terms. The icon kind comes from the icon layer name
 *    (alt "tick" / "cross") or, failing that, its stroke colour (red = incorrect). Empty
 *    placeholder cells (Framer pads the shorter column with blank rows) are dropped.
 *  - "Naming conventions": columns of short paragraphs. Every paragraph line (split at <br>)
 *    is one list item; runs set in a smaller type (e.g. "hyphen no space between numbers") are
 *    usage notes, kept as <em> inside the item.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

const kids = (el) => [...el.children].filter((c) => textOf(c) || c.querySelector('img'));
const TEXT = 'p, h1, h2, h3, h4, h5, h6';
const textNodes = (el) => [...el.querySelectorAll(TEXT)].filter((n) => !n.parentElement.closest(TEXT) && textOf(n));
const iconOf = (el) => el.querySelector('img[src^="data:image/svg+xml"]');

function iconKind(img) {
  const alt = (img.getAttribute('alt') || '').toLowerCase();
  if (/cross|close|wrong|incorrect|dont|don't|\bno\b/.test(alt)) return 'Incorrect';
  if (/tick|check|correct|\byes\b/.test(alt)) return 'Correct';
  let svg = '';
  try { svg = atob((img.getAttribute('src') || '').split(',')[1] || ''); } catch (e) { svg = ''; }
  const m = svg.match(/stroke="#([0-9a-f]{6})"/i) || svg.match(/fill="#([0-9a-f]{6})"/i);
  if (m) {
    const [r, g] = [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16)];
    if (r > 180 && g < 140) return 'Incorrect';
  }
  return 'Correct';
}

function fontSize(node) {
  const el = node.nodeType === 1 ? node : node.parentElement;
  const view = el && el.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return 0;
  try { return parseFloat(view.getComputedStyle(el).fontSize) || 0; } catch (e) { return 0; }
}

/** One <li> per <br>-separated line of p; smaller-type runs become <em> notes. */
function itemsOf(document, p) {
  const runs = [];
  const walker = document.createTreeWalker(p, 1 | 4);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === 1 && n.tagName === 'BR') runs.push({ br: true });
    else if (n.nodeType === 3 && n.textContent.trim()) runs.push({ text: n.textContent, size: fontSize(n) });
  }
  const base = Math.max(0, ...runs.filter((r) => r.text).map((r) => r.size));
  const items = [];
  let li = null;
  runs.forEach((r) => {
    if (r.br) { li = null; return; }
    if (!li) { li = document.createElement('li'); items.push(li); }
    const text = r.text.replace(/\s+/g, ' ');
    if (base && r.size && r.size < base * 0.8) {
      const em = document.createElement('em');
      em.textContent = text.trim();
      if (li.childNodes.length) li.append(' ');
      li.append(em);
    } else {
      li.append(text);
    }
  });
  items.forEach((item) => {
    const first = item.firstChild;
    const last = item.lastChild;
    if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, '');
    if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, '');
    // "term <em>note</em>": exactly one space before the note
    item.querySelectorAll('em').forEach((em) => {
      const prev = em.previousSibling;
      if (prev && prev.nodeType === 3) prev.textContent = `${prev.textContent.replace(/\s+$/, '')} `;
    });
  });
  return items.filter((item) => item.textContent.trim());
}

function listCell(document, items, marker) {
  const cell = [];
  if (marker) {
    const p = document.createElement('p');
    p.textContent = marker;
    cell.push(p);
  }
  const ul = document.createElement('ul');
  items.forEach((li) => ul.append(li));
  cell.push(ul);
  return cell;
}

export default function parse(element, { document }) {
  const rows = kids(element);
  const isIconGrid = rows.length >= 2 && rows.every((r) => kids(r).length >= 2 && kids(r).every((c) => iconOf(c)));
  const cells = [];

  if (isIconGrid) {
    const width = Math.max(...rows.map((r) => kids(r).length));
    for (let i = 0; i < width; i += 1) {
      const colCells = rows.map((r) => kids(r)[i]).filter(Boolean);
      const filled = colCells.filter((c) => textOf(c));
      if (!filled.length) continue; // eslint-disable-line no-continue
      const kinds = filled.map((c) => iconKind(iconOf(c)));
      const marker = kinds.filter((k) => k === 'Incorrect').length > kinds.length / 2 ? 'Incorrect' : 'Correct';
      const items = filled.map((c) => {
        const li = document.createElement('li');
        li.textContent = textOf(c);
        return li;
      });
      cells.push(listCell(document, items, marker));
    }
  } else {
    rows.forEach((col) => {
      const items = textNodes(col).flatMap((p) => itemsOf(document, p));
      if (items.length) cells.push(listCell(document, items, ''));
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-terms', cells: [cells] });
  element.replaceWith(block);
}
