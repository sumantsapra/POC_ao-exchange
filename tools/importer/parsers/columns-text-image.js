/* eslint-disable */
/* global WebImporter */

/**
 * columns-text-image (guideline-chapter, e.g. /colour "Colour distribution").
 * One row: [heading + paragraph(s) | image]. Columns are the element's non-empty child
 * wrappers in document order; each cell keeps its headings (source level), paragraphs,
 * lists and images. If the source has a single wrapper, text and image are split into two cells.
 * Inline-vector artwork kept by the cleanup transformer (data:image/svg+xml images) counts as content.
 * Tile colour: when the image column paints a non-white tile behind the logo (e.g. /ao-ballpark
 * "Primary Logo - Reverse" on royal blue, "Mono Reverse" on black), the text cell gets the
 * authorable line "Background: <AO colour name or #hex>" that the block turns into the tile colour.
 */
const AO_COLOURS = [
  ['White', [255, 255, 255]],
  ['Black', [0, 0, 0]],
  ['Process Blue', [0, 145, 210]],
  ['Royal Blue', [30, 40, 134]],
  ['Hits Different Blue', [0, 120, 255]],
  ['Navy', [0, 12, 60]],
  ['Dark Navy', [15, 18, 66]],
  ['Bright Blue', [0, 225, 255]],
  ['Lime', [225, 255, 0]],
  ['Sky Blue', [128, 217, 255]],
  ['Stone', [235, 232, 229]],
];

function parseRgb(value) {
  const m = (value || '').match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function paintOf(el) {
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return null;
  try { return parseRgb(view.getComputedStyle(el).backgroundColor); } catch (e) { return null; }
}

function colourName(rgb) {
  let best = null;
  AO_COLOURS.forEach(([name, ref]) => {
    const d = Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]);
    if (d <= 8 && (!best || d < best.d)) best = { d, name };
  });
  return best ? best.name : `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Non-white paint between the image and its column wrapper ('' = default white card). */
function tileColour(img, column) {
  for (let n = img.parentElement; n && n !== column.parentElement; n = n.parentElement) {
    const rgb = paintOf(n);
    if (rgb) return rgb.every((c) => c >= 245) ? '' : colourName(rgb);
  }
  return '';
}
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function hasContent(el) {
  return !!textOf(el) || !!el.querySelector('img:not([src^="data:"]), img[src^="data:image/svg+xml"], video');
}

function contentOf(document, root, seenImgs) {
  const out = [];
  root.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img, video').forEach((node) => {
    if (node.tagName === 'IMG') {
      const src = imgSrc(node);
      if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seenImgs.has(src)) return;
      seenImgs.add(src);
      const img = document.createElement('img');
      img.src = src;
      img.alt = node.getAttribute('alt') || '';
      out.push(img);
      return;
    }
    if (node.tagName === 'VIDEO') {
      const src = node.getAttribute('src') || (node.querySelector('source[src]') || {}).src;
      if (!src) return;
      const a = document.createElement('a');
      a.href = src;
      a.textContent = src;
      out.push(a);
      return;
    }
    if (node.parentElement.closest('ul, ol, p, h1, h2, h3, h4, h5, h6')) return;
    if (!textOf(node)) return;
    const el = document.createElement(node.tagName.toLowerCase());
    if (/^[UO]L$/.test(node.tagName)) {
      node.querySelectorAll('li').forEach((li) => {
        const nli = document.createElement('li');
        nli.textContent = textOf(li);
        el.append(nli);
      });
    } else {
      el.innerHTML = node.innerHTML;
      el.querySelectorAll('[class], [style]').forEach((c) => { c.removeAttribute('class'); c.removeAttribute('style'); });
    }
    out.push(el);
  });
  return out;
}

export default function parse(element, { document }) {
  let columns = [...element.children].filter(hasContent);
  // descend through single-child wrappers
  while (columns.length === 1 && [...columns[0].children].filter(hasContent).length > 1) {
    columns = [...columns[0].children].filter(hasContent);
  }
  const seenImgs = new Set();
  let row = columns.map((col) => contentOf(document, col, seenImgs)).filter((c) => c.length);
  if (row.length === 1) {
    const textCell = row[0].filter((n) => n.tagName !== 'IMG');
    const imgCell = row[0].filter((n) => n.tagName === 'IMG');
    row = imgCell.length && textCell.length ? [textCell, imgCell] : [row[0], ''];
  }

  // image-first logo rows: tile colour of the logo card
  const imgCol = columns.find((c) => c.querySelector('img') && !textOf(c));
  if (row.length === 2 && imgCol && columns[0] === imgCol && Array.isArray(row[1])) {
    const colour = tileColour(imgCol.querySelector('img'), imgCol);
    if (colour) {
      const p = document.createElement('p');
      p.textContent = `Background: ${colour}`;
      row[1].push(p);
    }
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-text-image', cells });
  element.replaceWith(block);
}
