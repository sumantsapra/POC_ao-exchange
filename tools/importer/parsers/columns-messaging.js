/* eslint-disable */
/* global WebImporter */

/**
 * columns-messaging (/partner-guidelines "Partner copy and messaging"): a light panel with the
 * role statements on top and do / don't sample lines below. Two rows with the same column count:
 * Row 1: one cell per role statement: label in bold, line break, role ("Your brand's role:" /
 *   "Contextual (why you show up)"). Framer sets the label weight either with <strong> or with a
 *   Bold / Semibold font family; both become <strong>.
 * Row 2: one cell per sample line: the tick / cross icon, then the line.
 * A shorter row is padded with empty cells.
 */
const TEXT_SEL = 'h1, h2, h3, h4, h5, h6, p, li';

function collapse(t) {
  return (t || '').replace(/\s+/g, ' ');
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function contentImages(el) {
  return [...el.querySelectorAll('img')].filter((img) => {
    const src = img.getAttribute('src') || '';
    return src && (!src.startsWith('data:') || src.startsWith('data:image/svg+xml'));
  });
}

function hasContent(el) {
  return !!collapse(el.textContent).trim() || contentImages(el).length > 0;
}

function isBold(el) {
  if (/^(STRONG|B)$/.test(el.tagName)) return true;
  const style = el.getAttribute('style') || '';
  return /--framer-font-family:[^;]*(Bold|Semibold)/i.test(style) && !el.querySelector('strong, b');
}

/** Copy inline content: text, line breaks, bold runs (as <strong>). */
function copyInline(document, from, to) {
  from.childNodes.forEach((n) => {
    if (n.nodeType === 3) { to.append(collapse(n.textContent)); return; }
    if (n.nodeType !== 1) return;
    if (n.tagName === 'BR') { to.append(document.createElement('br')); return; }
    if (isBold(n) && collapse(n.textContent).trim()) {
      const strong = document.createElement('strong');
      strong.textContent = collapse(n.textContent).trim();
      to.append(strong);
      return;
    }
    copyInline(document, n, to);
  });
}

const isBlank = (n) => (n.nodeType === 3 && !n.textContent.trim()) || n.nodeName === 'BR';

/** <p> copy of a text element with its line breaks and bold runs, trimmed; null when empty. */
function paragraph(document, source) {
  const p = document.createElement('p');
  copyInline(document, source, p);
  while (p.firstChild && isBlank(p.firstChild)) p.firstChild.remove();
  while (p.lastChild && isBlank(p.lastChild)) p.lastChild.remove();
  if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
  if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, '');
  p.querySelectorAll('br').forEach((br) => {
    const prev = br.previousSibling;
    const next = br.nextSibling;
    if (prev && prev.nodeType === 3) prev.textContent = prev.textContent.replace(/\s+$/, '');
    if (next && next.nodeType === 3) next.textContent = next.textContent.replace(/^\s+/, '');
  });
  return collapse(p.textContent).trim() ? p : null;
}

function texts(el) {
  return [...el.querySelectorAll(TEXT_SEL)].filter((t) => !t.parentElement.closest(TEXT_SEL));
}

export default function parse(element, { document }) {
  const kids = [...element.children].filter(hasContent);
  const roles = kids[0];
  const examples = kids[1];

  const roleCells = [];
  if (roles) texts(roles).forEach((t) => { const p = paragraph(document, t); if (p) roleCells.push([p]); });

  const exampleCells = [];
  if (examples) {
    [...examples.children].filter(hasContent).forEach((line) => {
      const cell = [];
      const icon = contentImages(line)[0];
      if (icon) {
        const img = document.createElement('img');
        img.src = imgSrc(icon);
        img.alt = icon.getAttribute('alt') || '';
        cell.push(img);
      }
      texts(line).forEach((t) => { const p = paragraph(document, t); if (p) cell.push(p); });
      if (cell.length) exampleCells.push(cell);
    });
  }

  const cols = Math.max(roleCells.length, exampleCells.length, 1);
  const pad = (row) => { while (row.length < cols) row.push(''); return row; };
  const cells = [];
  if (roleCells.length) cells.push(pad(roleCells));
  if (exampleCells.length) cells.push(pad(exampleCells));
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-messaging', cells });
  element.replaceWith(block);
}
