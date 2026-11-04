import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Normalise an authored hex value ("0091D2", "#0091d2", "fff") to "#rrggbb", or null.
 * @param {string} value
 * @returns {string|null}
 */
function normaliseHex(value) {
  const raw = (value || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw.split('').map((c) => c + c).join('')}`.toLowerCase();
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`.toLowerCase();
  return null;
}

/**
 * Relative luminance (WCAG) of a #rrggbb colour.
 * @param {string} hex
 * @returns {number}
 */
/* white text reaches the WCAG AA 4.5:1 ratio up to this background luminance; above it the tile
   gets navy text (the brand navy passes on every lighter swatch) */
const WHITE_TEXT_MAX_LUMINANCE = 0.18;

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function buildCopyButton(hex) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cards-swatch-copy';
  const label = 'Copy HEX';
  button.textContent = label;
  button.setAttribute('aria-label', `Copy hex value ${hex}`);
  let timer;
  button.addEventListener('click', async () => {
    try {
      await copyText(hex.toUpperCase());
      button.textContent = 'Copied';
      button.classList.add('is-copied');
    } catch (e) {
      button.textContent = 'Copy failed';
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      button.textContent = label;
      button.classList.remove('is-copied');
    }, 2000);
  });
  return button;
}

/**
 * Turn "Label: value" paragraphs into a definition list. Returns the hex if one is found.
 * @param {Element} body
 * @returns {string|null}
 */
function buildValues(body) {
  let hex = null;
  const dl = document.createElement('dl');
  dl.className = 'cards-swatch-values';
  [...body.querySelectorAll(':scope > p')].forEach((p) => {
    const text = p.textContent.trim();
    const match = text.match(/^([^:]{1,20}):\s*(.*)$/);
    if (!match) return;
    const [, key, value] = match;
    const dt = document.createElement('dt');
    dt.textContent = key.trim();
    const dd = document.createElement('dd');
    dd.textContent = value.trim();
    dl.append(dt, dd);
    if (/^hex$/i.test(key.trim()) && !hex) hex = normaliseHex(value);
    p.remove();
  });
  if (dl.children.length) body.append(dl);
  return hex;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-swatch-tile';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) {
        div.className = 'cards-swatch-image';
      } else if (!div.textContent.trim() && !div.children.length) {
        div.remove();
      } else {
        div.className = 'cards-swatch-body';
      }
    });

    const image = li.querySelector('.cards-swatch-image');
    const body = li.querySelector('.cards-swatch-body');
    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) heading.classList.add('cards-swatch-name');
      else {
        // Promote a leading paragraph without a "Label:" to the name.
        const first = body.querySelector(':scope > p');
        if (first && !first.textContent.includes(':')) first.classList.add('cards-swatch-name');
      }
      const hex = buildValues(body);
      if (hex) {
        li.style.setProperty('--swatch-color', hex);
        li.dataset.hex = hex;
        li.classList.add(luminance(hex) > WHITE_TEXT_MAX_LUMINANCE ? 'is-light' : 'is-dark');
        li.prepend(buildCopyButton(hex));
      }
    }
    if (image) {
      li.classList.add('has-image');
      if (!li.classList.contains('is-light')) li.classList.add('is-dark');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    // the swatch name is already in the tile heading: an alt repeating it is redundant
    const name = img.closest('li')?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim();
    if (name && img.alt.trim().toLowerCase() === name.toLowerCase()) img.alt = '';
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.textContent = '';
  block.append(ul);
}
