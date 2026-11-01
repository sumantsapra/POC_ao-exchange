/* eslint-disable */
/* global WebImporter */

/**
 * cards-misuse (incorrect-usage "Don't …" grid, e.g. /logos and /partner-guidelines "Incorrect usage").
 * Cards convention, 2 columns: each row = [misuse example image | "Don't …" caption paragraph(s)].
 * Tiles are the content children of the grid (single-child wrappers are descended); the example
 * image is the tile's largest content image, so the small red close-circle icon next to the caption
 * (kept as an inline-SVG image by the cleanup transformer) and the strike line are not imported:
 * the block draws both itself. Framer breakpoint copies are deduped by image URL + caption.
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

const TEXT = 'p, h1, h2, h3, h4, h5, h6';
const isContentImg = (img) => {
  const src = img.getAttribute('src') || '';
  return !!src && (!src.startsWith('data:') || src.startsWith('data:image/svg+xml'));
};
const contentImgs = (el) => [...el.querySelectorAll('img')].filter(isContentImg);
const area = (img) => (parseFloat(img.getAttribute('width')) || 0) * (parseFloat(img.getAttribute('height')) || 0);
const hasContent = (el) => !!textOf(el) || contentImgs(el).length > 0;
const isTile = (el) => !!textOf(el) && contentImgs(el).length > 0;

/** Tiles: descend single-child wrappers until the children are the image + caption tiles. */
function tilesOf(element) {
  let grid = element;
  for (;;) {
    const kids = [...grid.children].filter(hasContent);
    if (kids.length !== 1 || !isTile(kids[0])) break;
    const inner = [...kids[0].children].filter(hasContent);
    // the single child is a lone tile when its children split into image part and caption part
    if (inner.length >= 2 && !inner.every(isTile)) break;
    [grid] = kids;
  }
  const kids = [...grid.children].filter(hasContent);
  return kids.every(isTile) ? kids : [grid];
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  tilesOf(element).forEach((tile) => {
    const photo = contentImgs(tile).sort((a, b) => area(b) - area(a))[0];
    const captions = [...tile.querySelectorAll(TEXT)]
      .filter((n) => !n.parentElement.closest(TEXT))
      .map(textOf)
      .filter(Boolean);
    if (!photo && !captions.length) return;
    const src = photo ? imgSrc(photo) : '';
    const key = `${src}|${captions.join('|')}`;
    if (seen.has(key)) return;
    seen.add(key);

    let imageCell = '';
    if (photo) {
      imageCell = document.createElement('img');
      imageCell.src = src;
      imageCell.alt = photo.getAttribute('alt') || '';
    }
    const textCell = captions.map((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      return p;
    });
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-misuse', cells });
  element.replaceWith(block);
}
