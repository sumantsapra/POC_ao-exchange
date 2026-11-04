import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Banner overlay: a full-screen photo band with artwork laid over it (/graphic-elements
 * "Divider full screen" photo + logo pattern artwork).
 * Row 1: the background photo. Row 2 (and any further row): artwork shown over the photo.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    if (!row.querySelector('picture, img')) {
      row.remove();
      return;
    }
    row.className = i === 0 ? 'banner-overlay-background' : 'banner-overlay-layer';
    row.querySelectorAll('picture > img').forEach((img) => {
      const url = new URL(img.src, window.location.href);
      if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
    });
  });
}
