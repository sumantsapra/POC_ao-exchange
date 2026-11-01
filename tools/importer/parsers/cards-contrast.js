/* eslint-disable */
/* global WebImporter */

/**
 * cards-contrast (colour contrast pairs on guideline-chapter and sub-brand-guide pages).
 * Each row: [<p>Aa</p><p>Background: <strong>X</strong></p><p>Text: <strong>Y</strong></p>].
 * Tiles are found by content: a caption paragraph reading "Background ... Text ..."; the
 * sample text ("Aa") is the paragraph before it. Pairs are not deduped: the source repeats
 * some pairs on purpose (e.g. Navy Blue / Bright Blue twice on /colour).
 * Image mode (no "Background" captions, e.g. the /logos accessibility grid of 24 logo-on-colour
 * squares): each tile becomes one row whose sample is an image. The colour square is CSS in the
 * source, so the tile is rebuilt as one SVG: a rect in the tile's background colour with the logo
 * (and the strike-through line of inaccessible pairs) placed where they render; the artwork
 * arrives as data:image/svg+xml images from the cleanup transformer.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function captionPair(p) {
  const strongs = [...p.querySelectorAll('strong, b')].map(textOf).filter(Boolean);
  if (strongs.length >= 2) return [strongs[0], strongs[1]];
  const m = textOf(p).match(/background\s*:?\s*(.+?)\s*text\s*:?\s*(.+)$/i);
  return m ? [m[1], m[2]] : null;
}

function captionLine(document, label, value) {
  const p = document.createElement('p');
  p.append(`${label}: `);
  const strong = document.createElement('strong');
  strong.textContent = value;
  p.append(strong);
  return p;
}


const isContentImg = (img) => {
  const src = img.getAttribute('src') || '';
  return !!src && (!src.startsWith('data:') || src.startsWith('data:image/svg+xml'));
};
const contentImgs = (el) => [...el.querySelectorAll('img')].filter(isContentImg);

function cssColour(value) {
  let v = (value || '').trim();
  for (let i = 0; i < 5 && /var\(/.test(v); i += 1) {
    v = v.replace(/var\(\s*--[\w-]+\s*,\s*((?:[^()]|\([^()]*\))*)\)/g, '$1').replace(/var\(\s*--[\w-]+\s*\)/g, '');
  }
  v = v.trim();
  return !v || /^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/.test(v) ? '' : v;
}

/** Background colour of the tile or of a single-child wrapper inside it. */
function tileBackground(document, tile) {
  const view = document.defaultView;
  for (let n = tile; n; n = n.children.length === 1 ? n.children[0] : null) {
    let bg = '';
    try { bg = cssColour(view.getComputedStyle(n).backgroundColor); } catch (e) { bg = ''; }
    if (!bg) bg = cssColour(((n.getAttribute('style') || '').match(/background(?:-color)?\s*:\s*([^;]+)/) || [])[1]);
    if (bg) return bg;
  }
  return '';
}

function rectOf(el) {
  if (typeof el.getBoundingClientRect !== 'function') return null;
  const r = el.getBoundingClientRect();
  return r.width && r.height ? r : null;
}

function esc(v) {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

/** One SVG for a logo-on-colour tile: background rect + artwork images where they render. */
function tileImage(document, tile) {
  const imgs = contentImgs(tile);
  if (imgs.length === 1 && imgs[0].hasAttribute('data-excat-tile')) {
    // already rebuilt with its colour square by the cleanup transformer
    const img = document.createElement('img');
    img.src = imgs[0].getAttribute('src');
    img.alt = imgs[0].getAttribute('alt') || '';
    return img;
  }
  const box = rectOf(tile);
  const W = Math.round(box ? box.width : 90);
  const H = Math.round(box ? box.height : 90);
  const bg = tileBackground(document, tile);
  const parts = imgs.map((img) => {
    const r = rectOf(img);
    const w = r ? r.width : (parseFloat(img.getAttribute('width')) || W / 2);
    const h = r ? r.height : (parseFloat(img.getAttribute('height')) || H / 2);
    const x = r && box ? r.left - box.left : (W - w) / 2;
    const y = r && box ? r.top - box.top : (H - h) / 2;
    return `<image href="${esc(img.getAttribute('src'))}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `${bg ? `<rect width="${W}" height="${H}" fill="${esc(bg)}"/>` : ''}${parts.join('')}</svg>`;
  const out = document.createElement('img');
  out.src = `data:image/svg+xml;base64,${toBase64(svg)}`;
  out.alt = imgs.map((i) => i.getAttribute('alt') || '').find(Boolean) || '';
  return out;
}

/** Tiles = children with artwork; single-child wrappers holding several tiles are descended. */
function imageTiles(element) {
  let grid = element;
  for (;;) {
    const kids = [...grid.children].filter((c) => contentImgs(c).length);
    if (kids.length !== 1 || contentImgs(kids[0]).length <= 2) break;
    [grid] = kids;
  }
  return [...grid.children].filter((c) => contentImgs(c).length);
}

export default function parse(element, { document }) {
  const paras = [...element.querySelectorAll('p, h1, h2, h3, h4, h5, h6')].filter((p) => textOf(p));
  const cells = [];
  if (!paras.some((p) => /^background/i.test(textOf(p))) && contentImgs(element).length) {
    imageTiles(element).forEach((tile) => cells.push([[tileImage(document, tile)]]));
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contrast', cells });
    element.replaceWith(block);
    return;
  }
  paras.forEach((p, i) => {
    if (!/^background/i.test(textOf(p))) return;
    const pair = captionPair(p);
    if (!pair) return;
    const prev = paras[i - 1];
    const sample = prev && !/^background/i.test(textOf(prev)) && textOf(prev).length <= 4 ? textOf(prev) : 'Aa';
    const sampleP = document.createElement('p');
    sampleP.textContent = sample;
    cells.push([[sampleP, captionLine(document, 'Background', pair[0]), captionLine(document, 'Text', pair[1])]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contrast', cells });
  element.replaceWith(block);
}
