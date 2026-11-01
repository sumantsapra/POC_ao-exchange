import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns: photos.
 * Each row is a row of equal-width photos (any number of cells). Several rows of two
 * give a 2x2 grid. Rows stack to a single column on mobile.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-photos-row');
    const cells = [...row.children];
    row.style.setProperty('--columns-photos-count', cells.length || 1);
    cells.forEach((cell) => {
      cell.classList.add('columns-photos-cell');
      const pic = cell.querySelector('picture');
      if (!pic) return;
      // unwrap a picture wrapped in a lone paragraph
      const parent = pic.parentElement;
      if (parent !== cell && parent.tagName === 'P' && parent.children.length === 1) {
        parent.replaceWith(pic);
      }
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]));
  });
}
