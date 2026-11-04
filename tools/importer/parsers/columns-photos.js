/* eslint-disable */
/* global WebImporter */

/**
 * columns-photos (guideline-chapter and sub-brand-guide photo pairs / grids).
 * One cell per photo, every row the same cell count:
 *   2-3 photos -> one row; 4 photos -> 2 x 2 (as on /ao-live); more -> rows of 3, last row padded.
 * Photos are every content image in document order, deduped by URL (Framer breakpoint copies).
 * Inline-vector artwork kept by the cleanup transformer (data:image/svg+xml images) counts as content.
 * Per-photo setting: a photo the source crops off-centre (Framer object-position, e.g. /colour
 * "Application examples" photo 2 "center top") gets a "Position: top" line in its cell (top /
 * bottom / left / right, two words for corners, else the raw value); the block reads and hides it.
 * A gallery of side-by-side columns holding a video tile (/ao-one-point-slam) keeps its columns:
 * one row per tile position, one cell per column; the video cell is a link to the MP4.
 */
function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

const KEYWORDS = { 0: { x: 'left', y: 'top' }, 50: { x: 'center', y: 'center' }, 100: { x: 'right', y: 'bottom' } };

function percent(v) {
  const t = (v || '').trim().toLowerCase();
  if (t === 'left' || t === 'top') return 0;
  if (t === 'center') return 50;
  if (t === 'right' || t === 'bottom') return 100;
  const m = t.match(/^(-?[\d.]+)%$/);
  return m ? parseFloat(m[1]) : null;
}

/** "Position: …" value for an off-centre crop, '' when centred (inline Framer style). */
function positionOf(img) {
  const style = img.getAttribute('style') || '';
  const m = style.match(/object-position\s*:\s*([^;]+)/i);
  if (!m) return '';
  let parts = m[1].trim().toLowerCase().split(/\s+/);
  if (parts.length === 1) parts = /^(top|bottom)$/.test(parts[0]) ? ['center', parts[0]] : [parts[0], 'center'];
  // keyword order may be swapped ("top center")
  if (/^(top|bottom)$/.test(parts[0]) || /^(left|right)$/.test(parts[1])) parts = [parts[1], parts[0]];
  const [x, y] = parts.map(percent);
  if (x === null || y === null) return m[1].trim();
  if (x === 50 && y === 50) return '';
  const kx = KEYWORDS[x] && KEYWORDS[x].x;
  const ky = KEYWORDS[y] && KEYWORDS[y].y;
  if (kx && ky) return [ky === 'center' ? '' : ky, kx === 'center' ? '' : kx].filter(Boolean).join(' ');
  return `${x}% ${y}%`;
}

function videoSrc(video) {
  return video.getAttribute('src')
    || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src')) || '';
}

/** Gallery built as side-by-side columns of stacked media tiles (with a video): the columns. */
function mediaColumns(element) {
  if (!element.querySelector('video')) return null;
  const hasMedia = (el) => !!el.querySelector('img, video') || /^(IMG|VIDEO)$/.test(el.tagName);
  const cols = [...element.children].filter(hasMedia);
  return cols.length >= 2 ? cols : null;
}

/** Cell content for one media element: a photo (+ Position line) or a link to the video. */
function cellOf(document, source, seen) {
  if (source.tagName === 'VIDEO') {
    const src = videoSrc(source);
    if (!src || seen.has(src)) return null;
    seen.add(src);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;
    p.append(a);
    return p;
  }
  const src = imgSrc(source);
  if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seen.has(src)) return null;
  seen.add(src);
  const img = document.createElement('img');
  img.src = src;
  img.alt = source.getAttribute('alt') || '';
  const position = positionOf(source);
  if (!position) return img;
  const line = document.createElement('p');
  line.textContent = `Position: ${position}`;
  return [img, line];
}

export default function parse(element, { document }) {
  const seen = new Set();
  const cells = [];
  const columns = mediaColumns(element);
  if (columns) {
    // column-major source (each column a stack of tiles): rows of one tile per column, so the
    // gallery reads in the same places (/ao-one-point-slam photos + video)
    const stacks = columns.map((col) => [...col.querySelectorAll('img, video')]
      .map((m) => cellOf(document, m, seen)).filter(Boolean));
    const rows = Math.max(...stacks.map((st) => st.length));
    for (let r = 0; r < rows; r += 1) cells.push(stacks.map((st) => st[r] || ''));
  } else {
    const photos = [...element.querySelectorAll('img')].map((m) => cellOf(document, m, seen)).filter(Boolean);
    let perRow = photos.length;
    if (photos.length === 4) perRow = 2;
    else if (photos.length > 4) perRow = 3;
    for (let i = 0; i < photos.length; i += perRow) {
      const row = photos.slice(i, i + perRow);
      while (row.length < perRow) row.push('');
      cells.push(row);
    }
  }
  if (!cells.length) cells.push(['']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-photos', cells });
  element.replaceWith(block);
}
