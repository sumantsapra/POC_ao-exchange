import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns panel: images side by side, equal width, inside a rounded showcase panel.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-panel-row');
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('img, picture, video')) {
        cell.remove();
        return;
      }
      const onlyImage = cell.children.length === 1 && cell.querySelector('picture, img')
        && !cell.textContent.trim();
      cell.classList.add(onlyImage ? 'columns-panel-image' : 'columns-panel-text');
    });
    row.style.setProperty('--columns-panel-count', row.children.length || 1);
    if (!row.children.length) row.remove();
  });
  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}
