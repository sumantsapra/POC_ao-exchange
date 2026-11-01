import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards framed: artwork shown contained inside a white rounded frame,
 * with an optional heading + description rendered below the frame.
 * Options (block classes, CSS only): "short" (shorter frames), "reverse" (Hits Different Blue
 * frames for white artwork), "cover" (artwork fills the tile), "panel" (items grouped in one
 * Hits Different Blue panel).
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
      const frame = document.createElement('div');
      frame.className = 'cards-framed-frame';
      const media = imageCell.querySelector('picture') || imageCell.querySelector('img');
      frame.append(media);
      // keep any text authored alongside the image in cell 1
      if (imageCell.textContent.trim()) textCells.unshift(imageCell);
      li.append(frame);
    }

    if (textCells.length) {
      const body = document.createElement('div');
      body.className = 'cards-framed-body';
      textCells.forEach((cell) => {
        while (cell.firstChild) body.append(cell.firstChild);
      });
      // drop empty wrappers left by the authoring tool
      [...body.children].forEach((child) => {
        if (!child.textContent.trim() && !child.querySelector('img, picture')) child.remove();
      });
      if (body.children.length || body.textContent.trim()) li.append(body);
    }

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  const count = ul.children.length;
  block.classList.add(count === 2 ? 'cards-framed-cols-2' : 'cards-framed-cols-3');
  if (count === 1) block.classList.add('cards-framed-single');
  block.replaceChildren(ul);
}
