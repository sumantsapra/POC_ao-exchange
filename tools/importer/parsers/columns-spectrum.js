/* eslint-disable */
/* global WebImporter */

/**
 * columns-spectrum (/partner-guidelines "But first, who's your audience?": an audience scale
 * from "Invitation to play" to "Reinforce prestige", then the Playful / Premium videos).
 * Three columns: [start | between | end].
 *  - text rows: [start text | (scale artwork) | end text]: the audiences, then the end labels
 *    (headings keep their level). The scale artwork drawn between two text rows on the source
 *    is the middle cell of the row above it; the block draws it as a line under that row.
 *  - media row: the [video | icon | video] (or [video | video]) row that follows the scale in
 *    the same band: the two ends as videos (links to the MP4s) with the arrow icon between. It is
 *    moved into the block (its video blocks are not created separately).
 * The detector hands over the scale: rows of [start text | end text] around one scale image.
 */
const CONTENT_IMG = 'img:not([src^="data:"]), img[src^="data:image/svg+xml"]';
const TEXT_SEL = 'h1, h2, h3, h4, h5, h6, p';

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
  return !!textOf(el) || !!el.querySelector(`${CONTENT_IMG}, video`) || el.matches(`${CONTENT_IMG}, video`);
}

function contentChildren(el) {
  return [...el.children].filter((c) => !/^(SCRIPT|STYLE|HR)$/.test(c.tagName) && hasContent(c));
}

/** Single-child wrappers down to the element that holds the row's cells. */
function unwrap(el) {
  let node = el;
  for (let kids = contentChildren(node); kids.length === 1 && !/^(H\d|P|IMG)$/.test(kids[0].tagName); kids = contentChildren(node)) [node] = kids;
  return node;
}

function videoSrc(el) {
  const video = el.tagName === 'VIDEO' ? el : el.querySelector('video');
  if (!video) return '';
  return video.getAttribute('src')
    || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src')) || '';
}

function imageOf(img, document) {
  const out = document.createElement('img');
  out.src = imgSrc(img);
  out.alt = img.getAttribute('alt') || '';
  return out;
}

/** Text cell: the tile's outermost headings / paragraphs, re-created (no Framer markup). */
function textCell(tile, document) {
  return [...tile.querySelectorAll(TEXT_SEL)]
    .filter((t) => textOf(t) && !t.parentElement.closest(TEXT_SEL))
    .map((t) => {
      const out = document.createElement(/^H\d$/.test(t.tagName) ? t.tagName.toLowerCase() : 'p');
      out.textContent = textOf(t);
      return out;
    });
}

function mediaCell(tile, document) {
  const src = videoSrc(tile);
  if (src) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;
    p.append(a);
    return [p];
  }
  const img = tile.matches(CONTENT_IMG) ? tile : tile.querySelector(CONTENT_IMG);
  return img ? [imageOf(img, document)] : '';
}

/** [video | icon | video] or [video | video] row after the scale, inside the same band. */
function mediaRowAfter(element) {
  const band = element.closest('section');
  if (!band) return null;
  // eslint-disable-next-line no-bitwise
  const after = [...band.querySelectorAll('*')].filter((n) => !element.contains(n) && (element.compareDocumentPosition(n) & 4));
  return after.find((n) => {
    const kids = contentChildren(n);
    if (kids.length < 2 || kids.length > 3 || textOf(n)) return false;
    const isVideo = (k) => k.querySelectorAll('video').length === 1 && !k.querySelector(CONTENT_IMG);
    if (!isVideo(kids[0]) || !isVideo(kids[kids.length - 1])) return false;
    return kids.length === 2 || (kids[1].querySelectorAll(CONTENT_IMG).length === 1 && !kids[1].querySelector('video'));
  }) || null;
}

export default function parse(element, { document }) {
  const cells = [];
  contentChildren(element).forEach((child) => {
    const row = unwrap(child);
    const imgs = row.matches(CONTENT_IMG) ? [row] : [...row.querySelectorAll(CONTENT_IMG)];
    if (!textOf(row) && imgs.length === 1) {
      // the scale between two text rows: middle cell of the row above it
      const above = cells[cells.length - 1];
      if (above) above[1] = [imageOf(imgs[0], document)];
      else cells.push(['', [imageOf(imgs[0], document)], '']);
      return;
    }
    const kids = contentChildren(row);
    const start = kids.length >= 2 ? kids[0] : row;
    const end = kids.length >= 2 ? kids[kids.length - 1] : null;
    cells.push([textCell(start, document), '', end ? textCell(end, document) : '']);
  });

  const media = mediaRowAfter(element);
  if (media) {
    const tiles = contentChildren(media);
    cells.push([
      mediaCell(tiles[0], document),
      tiles.length === 3 ? mediaCell(tiles[1], document) : '',
      mediaCell(tiles[tiles.length - 1], document),
    ]);
    media.remove();
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-spectrum', cells });
  element.replaceWith(block);
}
