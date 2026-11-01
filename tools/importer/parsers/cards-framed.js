/* eslint-disable */
/* global WebImporter */

/**
 * cards-framed (artwork contained in a white rounded frame, optional title + description under it):
 * /logos lockup pairs and exclusion-zone frames, /ao-reserve secondary / limited-use logos,
 * exclusion zone and Visual Devices, /graphic-elements Patterns theory, sub-brand exclusion zones.
 * Cards convention, 2 columns: each row = [artwork image | optional <h3> title + paragraph(s)].
 * Tiles are the content children of the grid (single-child wrappers are descended); the artwork is
 * the tile's largest content image (inline-vector logos arrive as data:image/svg+xml images from the
 * cleanup transformer). The first short line of a multi-line tile becomes the title.
 * Options (block variants, read from the live page styling):
 *  - "short": frames rendered at most ~300px tall (e.g. Visual Devices 250px).
 *  - "reverse": every frame is painted Hits Different Blue (#0078ff), e.g. /ao-shop Stacked Logo /
 *    Vertical Logo (white artwork).
 *  - "panel": the frames are unpainted and the tiles share one #0078ff panel, e.g. /ao-shop
 *    "where products appear on / off court".
 *  - "cover": unpainted frames whose artwork fills the tile width (cropped photo-like artwork),
 *    e.g. /graphic-elements Forward Slash / Half-Circle.
 * Text-only children next to the tiles (a shared note) stay as default content after the block.
 * Framer breakpoint copies are deduped by image URL + text.
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

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const TEXT = `p, li, ${HEADINGS}`;
const isContentImg = (img) => {
  const src = img.getAttribute('src') || '';
  return !!src && (!src.startsWith('data:') || src.startsWith('data:image/svg+xml'));
};
const contentImgs = (el) => [...el.querySelectorAll('img')].filter(isContentImg);
const area = (img) => (parseFloat(img.getAttribute('width')) || 1) * (parseFloat(img.getAttribute('height')) || 1);
const hasContent = (el) => !!textOf(el) || contentImgs(el).length > 0;
const textNodesOf = (el) => [...el.querySelectorAll(TEXT)].filter((n) => !n.parentElement.closest(TEXT) && textOf(n));

/** Tiles: descend single-child wrappers; each tile holds exactly one artwork image. */
function tilesOf(element) {
  let grid = element;
  for (let kids = [...grid.children].filter(hasContent);
    kids.length === 1 && contentImgs(kids[0]).length > 1;
    kids = [...grid.children].filter(hasContent)) {
    [grid] = kids;
  }
  const kids = [...grid.children].filter(hasContent);
  const withImg = kids.filter((k) => contentImgs(k).length);
  if (withImg.length >= 1 && withImg.every((k) => contentImgs(k).length === 1)) {
    return { tiles: withImg, notes: kids.filter((k) => !contentImgs(k).length) };
  }
  return { tiles: [grid], notes: [] };
}

/** Height of the frame holding the artwork (live browser only, 0 elsewhere). */
function frameHeight(img, tile) {
  if (typeof tile.getBoundingClientRect === 'function' && !textOf(tile)) {
    return tile.getBoundingClientRect().height || 0; // an image-only tile is the frame
  }
  let frame = img;
  while (frame.parentElement && frame.parentElement !== tile && !textOf(frame.parentElement)) frame = frame.parentElement;
  if (typeof frame.getBoundingClientRect !== 'function') return 0;
  return frame.getBoundingClientRect().height || 0;
}

const HD_BLUE = [0, 120, 255];

function parseRgb(value) {
  const m = (value || '').match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

/** Opaque background colour of an element (live browser only, null elsewhere). */
function paintOf(el) {
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return null;
  try { return parseRgb(view.getComputedStyle(el).backgroundColor); } catch (e) { return null; }
}

const near = (rgb, ref, tol = 30) => !!rgb && Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]) < tol;

/** Painted frame behind the artwork: first painted element from the image up to the tile. */
function framePaint(img, tile) {
  for (let n = img.parentElement; n; n = n.parentElement) {
    const rgb = paintOf(n);
    if (rgb) return rgb;
    if (n === tile) break;
  }
  return null;
}

/**
 * Paint shared by all tiles: first painted element from the tiles' parent up to the block
 * element, then up through wrappers holding exactly the block's content (stops at a section).
 */
function gridPaint(tile, element) {
  const sig = (el) => `${textOf(el)}|${contentImgs(el).length}`;
  const own = sig(element);
  for (let n = tile.parentElement; n && n.tagName !== 'SECTION'; n = n.parentElement) {
    if (!n.contains(element) || n === element || sig(n) === own) {
      const rgb = paintOf(n);
      if (rgb) return rgb;
    } else {
      break;
    }
  }
  return null;
}

/** The artwork fills its tile edge to edge (live browser only). */
function fillsTile(img, tile) {
  if (typeof img.getBoundingClientRect !== 'function') return false;
  const a = img.getBoundingClientRect();
  const t = tile.getBoundingClientRect();
  return a.width > 0 && t.width > 0 && a.width >= t.width * 0.95 && a.height >= 150;
}

export default function parse(element, { document }) {
  const { tiles, notes } = tilesOf(element);
  const cells = [];
  const seen = new Set();
  const heights = [];
  const frames = []; // { paint, fills } per artwork tile
  tiles.forEach((tile) => {
    const art = contentImgs(tile).sort((a, b) => area(b) - area(a))[0];
    const texts = textNodesOf(tile);
    if (!art && !texts.length) return;
    const src = art ? imgSrc(art) : '';
    const key = `${src}|${texts.map(textOf).join('|')}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (art) {
      heights.push(frameHeight(art, tile));
      frames.push({ tile, paint: framePaint(art, tile), fills: fillsTile(art, tile) });
    }

    let imageCell = '';
    if (art) {
      imageCell = document.createElement('img');
      imageCell.src = src;
      imageCell.alt = art.getAttribute('alt') || '';
    }
    const textCell = texts.map((n, i) => {
      const t = textOf(n);
      const isTitle = i === 0 && texts.length > 1 && (/^H[1-6]$/.test(n.tagName) || t.split(' ').length <= 6);
      const el = document.createElement(isTitle ? 'h3' : 'p');
      el.textContent = t;
      return el;
    });
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const measured = heights.filter((h) => h > 0);
  const short = measured.length > 0 && measured.every((h) => h <= 300);
  const options = [];
  if (short) options.push('short');
  if (frames.length) {
    const unpainted = frames.every((f) => !f.paint);
    if (frames.every((f) => near(f.paint, HD_BLUE))) options.push('reverse');
    else if (unpainted && near(gridPaint(frames[0].tile, element), HD_BLUE)) options.push('panel');
    else if (unpainted && frames.every((f) => f.fills)) options.push('cover');
  }
  const name = options.length ? `cards-framed (${options.join(', ')})` : 'cards-framed';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);

  let anchor = block;
  notes.forEach((note) => {
    textNodesOf(note).forEach((t) => {
      const el = document.createElement(/^H[1-6]$/.test(t.tagName) ? t.tagName.toLowerCase() : 'p');
      el.textContent = textOf(t);
      anchor.after(el);
      anchor = el;
    });
  });
}
