import { createOptimizedPicture } from '../../scripts/aem.js';

const BACKDROP_RE = /^backdrop$/i;

/**
 * Cards shape: small centred graphic icons in an unpainted grid, optional name.
 * Rows: [image | optional name]. Also:
 * - a text-only row before the images holding a heading: the set's title, shown above the card;
 * - a text-only row after the images: the set's caption, shown below the card
 *   (both used by the "half" option: sets two per row, e.g. /graphic-elements icons);
 * - an image whose name is "Backdrop": the card background behind the other images
 *   (/opening-week "Type Application"); the line is not shown.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  let title = null;
  let caption = null;
  [...block.children].forEach((row) => {
    const hasImage = !!row.querySelector('picture, img');
    if (!hasImage && row.textContent.trim()) {
      const content = [...row.children].find((c) => c.textContent.trim());
      if (!ul.children.length && !title && content.querySelector('h1, h2, h3, h4, h5, h6')) {
        title = content;
        title.className = 'cards-shape-title';
      } else {
        caption = content;
        caption.className = 'cards-shape-caption';
      }
      return;
    }
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    const label = [...li.children].find((div) => !div.querySelector('picture, img'));
    if (label && BACKDROP_RE.test(label.textContent.trim())) {
      const backdrop = li.querySelector('picture, img');
      const layer = document.createElement('div');
      layer.className = 'cards-shape-backdrop';
      layer.append(backdrop);
      block.classList.add('cards-shape-has-backdrop');
      block.prepend(layer);
      return;
    }
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture, img')) {
        div.className = 'cards-shape-card-image';
      } else if (div.textContent.trim()) {
        div.className = 'cards-shape-card-body';
      } else {
        div.remove();
      }
    });
    if (li.children.length) ul.append(li);
  });
  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const wide = img.closest('.cards-shape-backdrop');
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: wide ? '1200' : '400' }]));
  });
  [...block.children].forEach((child) => { if (!child.classList.contains('cards-shape-backdrop')) child.remove(); });
  block.append(ul);
  // title above and caption below the card (siblings in the block wrapper)
  if (title) block.before(title);
  if (caption) block.after(caption);
}
