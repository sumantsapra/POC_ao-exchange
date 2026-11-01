import { createOptimizedPicture } from '../../scripts/aem.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(name, attrs) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/** Thin diagonal strike line, bottom-left to top-right. */
function createStrike() {
  const svg = svgEl('svg', {
    class: 'cards-misuse-strike',
    viewBox: '0 0 100 100',
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.append(svgEl('line', {
    x1: '10',
    y1: '90',
    x2: '90',
    y2: '10',
    'vector-effect': 'non-scaling-stroke',
  }));
  return svg;
}

/** Small "prohibited" (circle with slash) icon. */
function createIcon() {
  const svg = svgEl('svg', {
    class: 'cards-misuse-icon',
    viewBox: '0 0 20 20',
    width: '20',
    height: '20',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.append(svgEl('circle', { cx: '10', cy: '10', r: '8.5' }));
  svg.append(svgEl('line', {
    x1: '4', y1: '16', x2: '16', y2: '4',
  }));
  return svg;
}

/**
 * Cards misuse: incorrect-usage examples. Each image gets a red diagonal
 * strike and each caption a red prohibited icon, both drawn by the block.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const textCells = cells.filter((c) => c !== imageCell && c.textContent.trim());

    if (imageCell) {
      const media = document.createElement('div');
      media.className = 'cards-misuse-image';
      media.append(imageCell.querySelector('picture') || imageCell.querySelector('img'));
      media.append(createStrike());
      if (imageCell.textContent.trim()) textCells.unshift(imageCell);
      li.append(media);
    }

    if (textCells.length) {
      const caption = document.createElement('div');
      caption.className = 'cards-misuse-caption';
      const text = document.createElement('div');
      text.className = 'cards-misuse-caption-text';
      textCells.forEach((cell) => {
        while (cell.firstChild) text.append(cell.firstChild);
      });
      caption.append(createIcon(), text);
      li.append(caption);
    }

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
