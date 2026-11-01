import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.(svg|gif)$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/**
 * Cards mosaic: image-only photo collage. Each row = one tile
 * (cell 1 picture, optional cell 2 text shown as a caption).
 * Tile placement (column / row spans) is handled in CSS, mirroring the source grid.
 * @param {Element} block
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'cards-mosaic-grid';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-mosaic-item';
    const [imageCell, textCell] = [...row.children];
    const picture = imageCell?.querySelector('picture');
    if (picture) {
      const media = document.createElement('div');
      media.className = 'cards-mosaic-image';
      media.append(picture);
      li.append(media);
    }
    if (textCell && textCell.textContent.trim()) {
      const body = document.createElement('div');
      body.className = 'cards-mosaic-body';
      body.append(...textCell.childNodes);
      li.append(body);
    }
    if (li.children.length) list.append(li);
  });

  optimizePictures(list);
  block.replaceChildren(list);
}
