/* eslint-disable */
/* global WebImporter */

/**
 * cards-logo (sub-brand-guide logo-version grid: image-only tiles).
 * Each row: [logo tile image | optional version label (empty on /ao-live)].
 * Tiles = every content image in document order, deduped by URL (Framer breakpoint copies);
 * a label is any text inside the image's own tile wrapper.
 * Inline-vector artwork kept by the cleanup transformer (data:image/svg+xml images) counts as content.
 * Tile colour: when the logo sits on a painted tile (Framer "Logo placeholder", e.g. #0078ff on
 * /ao-shop, #000c3d / #80d9ff on /ao-reserve), or directly on a coloured page background with no
 * tile (/partner-guidelines navy page), the text cell gets an authorable line
 * "Background: <AO colour name or #hex>" that the block turns into the tile colour.
 * White tiles and logos on a coloured section band (the section style paints it) get no line;
 * logos with no tile on a page colour that the section style paints get "Background: None".
 */
const AO_COLOURS = [
  ['White', [255, 255, 255]],
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

const isWhitish = (rgb) => rgb.every((c) => c >= 245);

function colourName(rgb) {
  let best = null;
  AO_COLOURS.forEach(([name, ref]) => {
    const d = Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]);
    if (d <= 8 && (!best || d < best.d)) best = { d, name };
  });
  return best ? best.name : `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Outermost content <section> holding el. */
function bandOf(el) {
  let band = el.closest('section');
  while (band && band.parentElement && band.parentElement.closest('section')) {
    band = band.parentElement.closest('section');
  }
  return band;
}

/**
 * Section styles of the section holding el: the metadata of the nearest preceding section break
 * inserted by the sections transformer (beforeTransform), e.g. ['royal-blue'].
 */
function sectionStyles(el) {
  const doc = el.ownerDocument;
  // eslint-disable-next-line no-bitwise
  const before = [...doc.querySelectorAll('hr')].filter((hr) => hr.compareDocumentPosition(el) & 4);
  const hr = before[before.length - 1];
  if (!hr) return [];
  try {
    const meta = JSON.parse(hr.getAttribute('data-excat-section-meta') || '{}');
    return (meta.style || '').split(',').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    return [];
  }
}

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Paint that belongs to the artwork, not to a tile: a Framer CSS-mask "Vector" layer filled with
 * the logo colour (/logos core logos), or any box no larger than the logo image itself.
 */
function isArtworkPaint(n, img) {
  const view = n.ownerDocument.defaultView;
  try {
    const cs = view.getComputedStyle(n);
    const mask = cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image') || 'none';
    if (mask && mask !== 'none') return true;
  } catch (e) {
    // no computed style: fall through to the box test
  }
  if (typeof n.getBoundingClientRect !== 'function') return false;
  const a = n.getBoundingClientRect();
  const b = img.getBoundingClientRect();
  return a.width > 0 && b.width > 0 && a.width <= b.width + 2 && a.height <= b.height + 2;
}

/** Colour behind the logo that the tile must show, or '' (default white tile / section style). */
function tileColour(img, tile) {
  const band = bandOf(img);
  for (let n = img.parentElement; n && n.nodeType === 1; n = n.parentElement) {
    const rgb = paintOf(n);
    if (rgb && isArtworkPaint(n, img)) continue; // eslint-disable-line no-continue
    if (rgb) {
      if (isWhitish(rgb)) return '';
      const name = colourName(rgb);
      if (n === tile || tile.contains(n)) return name;
      // no tile behind the logo: a coloured band is the section style's job (the section
      // element itself, or a band wrapper the section style already paints); a panel or a page
      // background that no section style paints becomes the tile colour
      if (band && n === band) return '';
      // logo straight on a page colour the section style already paints (e.g. /partner-guidelines
      // designations on the navy page): no tile at all
      if (sectionStyles(img).includes(slug(name))) return 'None';
      return name;
    }
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

function tileOf(img, root) {
  let node = img;
  while (node.parentElement && node.parentElement !== root
    && node.parentElement.querySelectorAll('img:not([src^="data:"]), img[src^="data:image/svg+xml"]').length === 1) {
    node = node.parentElement;
  }
  return node;
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  element.querySelectorAll('img').forEach((source) => {
    const src = imgSrc(source);
    if (!src || (src.startsWith('data:') && !src.startsWith('data:image/svg+xml')) || seen.has(src)) return;
    seen.add(src);
    const img = document.createElement('img');
    img.src = src;
    img.alt = source.getAttribute('alt') || '';
    const tile = tileOf(source, element);
    const label = textOf(tile);
    const colour = tileColour(source, tile);
    const textCell = [];
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      textCell.push(p);
    }
    if (colour) {
      const p = document.createElement('p');
      p.textContent = `Background: ${colour}`;
      textCell.push(p);
    }
    cells.push([img, textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-logo', cells });
  element.replaceWith(block);
}
