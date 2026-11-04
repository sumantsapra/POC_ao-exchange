/* eslint-disable */
/* global WebImporter */

/**
 * cards-shape (graphic shape / icon / illustration grids).
 * Each row: [shape image | optional shape name (empty on /ao-live)].
 * Shapes = every content image in document order, deduped by URL (Framer breakpoint copies);
 * a name is any text inside the image's own tile wrapper.
 * Inline-vector artwork kept by the cleanup transformer (data:image/svg+xml images) counts as content.
 *
 * Measured on the live page (the importer renders at desktop width):
 *  - backdrop: an image that covers the whole grid behind the other artworks (/opening-week
 *    "Type Application" halftone panel) is the card background: its row is [image | "Backdrop"];
 *    the block reads and hides the line.
 *  - option "half": the grid sits in a group [heading | card | optional caption] that shares a row
 *    with another group (/graphic-elements icon sets, two per row). The group heading and caption
 *    belong to the block: first row = heading, last row = caption; the block shows them above /
 *    below the card.
 *  - option "logos": wide artwork (median >= 120px) four per row, each at the start of its column
 *    (/ao-reserve "Product Logos"; shape sets are centred in their columns).
 *  - option "framed": the grid sits in a thin light outline on a dark panel (/ao-reserve
 *    "Illustrative Icons": a white panel with an inset navy grid).
 *  - option "stickers": large artwork five per row on a white card, each filling its grid
 *    column (every artwork the same width, >= 150px), e.g. /opening-week "Stickers" (184px at
 *    1440); icon / illustration sets keep their own, smaller artwork sizes, and shapes straight
 *    on a dark band (/ao-live "Rhythmic Shapes") are not on a card.
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

const CONTENT_IMG = 'img:not([src^="data:"]), img[src^="data:image/svg+xml"]';
const HEADING = 'h1, h2, h3, h4, h5, h6';

function tileOf(img, root) {
  let node = img;
  while (node.parentElement && node.parentElement !== root
    && node.parentElement.querySelectorAll(CONTENT_IMG).length === 1) {
    node = node.parentElement;
  }
  return node;
}

function rectOf(el) {
  if (!el || typeof el.getBoundingClientRect !== 'function') return null;
  const r = el.getBoundingClientRect();
  return r.width > 1 && r.height > 1 ? r : null;
}

function styleOf(el) {
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return null;
  try { return view.getComputedStyle(el); } catch (e) { return null; }
}

function rgbOf(value) {
  const m = (value || '').match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) return null;
  return [m[1], m[2], m[3]].map((c) => parseInt(c, 10));
}

const luminance = (rgb) => (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;

/** Image covering (>= 90%) the grid box, drawn behind the other artworks. */
function backdropOf(element, imgs) {
  const box = rectOf(element);
  if (!box || imgs.length < 3) return null;
  return imgs.find((img) => {
    const r = rectOf(img);
    return r && r.width * r.height >= 0.9 * box.width * box.height;
  }) || null;
}

/** Group [heading | card | caption] sharing a flex row with another group, or null. */
function halfGroupOf(element) {
  let group = element;
  while (group.parentElement && group.parentElement.tagName !== 'SECTION'
    && group.parentElement.querySelectorAll(HEADING).length <= element.querySelectorAll(HEADING).length + 1
    && group.parentElement.querySelectorAll(CONTENT_IMG).length === element.querySelectorAll(CONTENT_IMG).length) {
    group = group.parentElement;
  }
  if (group === element) return null;
  const heads = [...group.querySelectorAll(HEADING)].filter((h) => !element.contains(h) && textOf(h));
  if (heads.length !== 1) return null;
  const row = group.parentElement;
  const g = rectOf(group);
  const r = rectOf(row);
  if (!g || !r || g.width > 0.6 * r.width) return null;
  // a sibling group on the same row (side by side)
  const sibling = [...row.children].some((c) => {
    if (c === group) return false;
    const cr = rectOf(c);
    return cr && Math.abs(cr.top - g.top) < 4 && c.querySelector(HEADING) && c.querySelector(CONTENT_IMG);
  });
  if (!sibling) return null;
  const caption = [...group.querySelectorAll('p')]
    .filter((p) => !element.contains(p) && !p.parentElement.closest('p') && textOf(p));
  return { group, heading: heads[0], caption };
}

/** Median rendered width of the artworks and their column count on the first row. */
function layoutOf(imgs) {
  const rects = imgs.map(rectOf).filter(Boolean);
  if (!rects.length) return null;
  const widths = rects.map((r) => r.width).sort((a, b) => a - b);
  const top = Math.min(...rects.map((r) => r.top));
  const firstRow = rects.filter((r) => r.top < top + Math.min(...rects.map((x) => x.height)) * 0.8);
  return {
    median: widths[Math.floor(widths.length / 2)],
    min: widths[0],
    max: widths[widths.length - 1],
    cols: firstRow.length,
    left: Math.min(...firstRow.map((r) => r.left)),
  };
}

/** Light outline around a dark grid panel: painted light ancestor whose content child is dark. */
function isFramed(element) {
  for (let n = element, d = 0; n && d < 3 && n.tagName !== 'SECTION'; n = n.parentElement, d += 1) {
    const outer = rgbOf((styleOf(n) || {}).backgroundColor);
    if (!outer || luminance(outer) < 0.9) continue;
    const inner = [...n.children].find((c) => {
      const rgb = rgbOf((styleOf(c) || {}).backgroundColor);
      return rgb && luminance(rgb) < 0.3;
    });
    if (inner) return true;
  }
  return false;
}

/** Light painted card (white) holding the grid, within a few wrappers (not the band itself). */
function onLightCard(element) {
  for (let n = element, d = 0; n && d < 4 && n.tagName !== 'SECTION'; n = n.parentElement, d += 1) {
    const rgb = rgbOf((styleOf(n) || {}).backgroundColor);
    if (rgb && luminance(rgb) >= 0.9) return true;
  }
  return false;
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  const sources = [...element.querySelectorAll('img')].filter((source) => {
    const src = imgSrc(source);
    if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seen.has(src)) return false;
    seen.add(src);
    return true;
  });

  const backdrop = backdropOf(element, sources);
  const half = halfGroupOf(element);
  const options = [];

  if (half) {
    const h = document.createElement(half.heading.tagName.toLowerCase());
    h.textContent = textOf(half.heading);
    cells.push([h]);
    options.push('half');
  }

  const tiles = [];
  const artworks = [];
  sources.forEach((source) => {
    const img = document.createElement('img');
    img.src = imgSrc(source);
    img.alt = source.getAttribute('alt') || '';
    if (source === backdrop) {
      const line = document.createElement('p');
      line.textContent = 'Backdrop';
      cells.push([img, line]);
      return;
    }
    const tile = tileOf(source, element);
    tiles.push(tile);
    artworks.push(source);
    const name = textOf(tile);
    let textCell = '';
    if (name) {
      textCell = document.createElement('p');
      textCell.textContent = name;
    }
    cells.push([img, textCell]);
  });

  if (half && half.caption.length) {
    cells.push([half.caption.map((p) => {
      const out = document.createElement('p');
      out.textContent = textOf(p);
      return out;
    })]);
  }

  if (!half && !backdrop) {
    const layout = layoutOf(artworks);
    const box = rectOf(element);
    // product logos sit at the start of their columns (shape sets are centred in theirs)
    const leftAligned = !!(layout && box && Math.abs(layout.left - box.left) <= 2);
    if (layout && layout.cols === 4 && layout.median >= 120 && leftAligned && !isFramed(element)) options.push('logos');
    else if (isFramed(element)) options.push('framed');
    else if (layout && layout.cols === 5 && layout.min >= 150 && layout.max - layout.min <= 2
      && onLightCard(element)) options.push('stickers');
  }

  // the moved group heading / caption leave the default content
  if (half) {
    half.heading.remove();
    half.caption.forEach((p) => p.remove());
  }

  const name = options.length ? `cards-shape (${options.join(', ')})` : 'cards-shape';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
