import { createOptimizedPicture } from '../../scripts/aem.js';

const SVG_DATA_URI = /^data:image\/svg\+xml/i;

/**
 * Returns true when an inline SVG data URI only paints white/near-white fills
 * (a "reverse" logo), so its tile must stay transparent instead of white.
 * @param {string} src
 * @returns {boolean}
 */
function isLightSvg(src) {
  try {
    const [meta, data] = src.split(',', 2);
    const svg = /;base64/i.test(meta) ? atob(data) : decodeURIComponent(data);
    const fills = [...svg.matchAll(/fill\s*[:=]\s*["']?\s*([^"';>]+)/gi)]
      .map((m) => m[1].trim().toLowerCase())
      .filter((v) => v && v !== 'none');
    if (!fills.length) return false;
    return fills.every((v) => {
      if (/^(#fff|#ffffff|white)$/.test(v)) return true;
      const rgb = v.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/);
      return !!rgb && rgb.slice(1, 4).every((c) => Number(c) >= 240);
    });
  } catch (e) {
    return false;
  }
}

/* AO brand colours an author can name in a "Background: <name>" line */
const TILE_COLOURS = {
  white: 'var(--ao-white, #fff)',
  'process blue': 'var(--ao-process-blue, #0091d2)',
  'royal blue': 'var(--ao-royal-blue, #1e2886)',
  'hits different blue': 'var(--ao-hits-different-blue, #0078ff)',
  navy: 'var(--ao-navy, #000c3c)',
  'navy blue': 'var(--ao-navy, #000c3c)',
  'dark navy': '#0f1242',
  'bright blue': 'var(--ao-bright-blue, #00e1ff)',
  lime: 'var(--ao-lime, #e1ff00)',
  'lime green': 'var(--ao-lime, #e1ff00)',
  'sky blue': '#80d9ff',
  stone: '#ebe8e5',
  none: 'transparent',
};

const BACKGROUND_LINE = /^\s*(?:background|tile)\s*:\s*(.+?)\s*$/i;

/**
 * CSS colour for an authored tile colour: an AO colour name or a hex value.
 * @param {string} value
 * @returns {string|null}
 */
function tileColour(value) {
  const key = value.toLowerCase().replace(/\s+/g, ' ').trim();
  if (TILE_COLOURS[key]) return TILE_COLOURS[key];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) return key;
  return null;
}

/**
 * Reads and removes the "Background: <colour>" line of an item.
 * @param {Element} li
 * @returns {string|null} CSS colour
 */
function takeTileColour(li) {
  let colour = null;
  // a lone paragraph is unwrapped into its cell, so bare-text cells are candidates too
  const lines = [...li.querySelectorAll('p'), ...[...li.children].filter((div) => !div.children.length)];
  lines.forEach((line) => {
    const m = line.textContent.match(BACKGROUND_LINE);
    const value = m && tileColour(m[1]);
    if (!value) return;
    colour = value;
    if (line.tagName === 'P') line.remove();
    else line.textContent = '';
  });
  return colour;
}

/**
 * Cards logo: grid of logo tiles with optional caption.
 * - default: each logo sits centred on a rounded tile (logo at its natural size)
 * - per-item tile colour: a "Background: <AO colour name | #hex>" line in the item's text
 *   (e.g. "Background: Hits Different Blue"); the line is removed from view
 * - cards-logo-cols-4 (4+ items): edge-to-edge logo-on-colour image grid
 * - cards-logo-vector: every logo is an inline SVG artwork
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    const colour = takeTileColour(li);
    if (colour) {
      li.classList.add(colour === 'transparent' ? 'cards-logo-card-plain' : 'cards-logo-card-coloured');
      li.style.setProperty('--cards-logo-tile-background', colour);
    }
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture, img')) {
        div.className = 'cards-logo-card-image';
      } else if (div.textContent.trim()) {
        div.className = 'cards-logo-card-body';
      } else {
        div.remove();
      }
    });
    const img = li.querySelector('.cards-logo-card-image img');
    if (!colour && img && SVG_DATA_URI.test(img.getAttribute('src') || '')
      && isLightSvg(img.getAttribute('src'))) {
      li.classList.add('cards-logo-card-light');
    }
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  const imgs = [...ul.querySelectorAll('.cards-logo-card-image img')];
  if (imgs.length && imgs.every((img) => SVG_DATA_URI.test(img.getAttribute('src') || ''))) {
    block.classList.add('cards-logo-vector');
  }
  if (ul.children.length === 3) block.classList.add('cards-logo-cols-3');
  if (ul.children.length > 3) block.classList.add('cards-logo-cols-4');
  block.replaceChildren(ul);
}
