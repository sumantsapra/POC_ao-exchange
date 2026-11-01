import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards social: social media channels, platform icon above the name and handles
 * (/tone-of-voice "Social media"). Each row: [icon image | text].
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img') && !cell.textContent.trim()) {
        cell.className = 'cards-social-card-image';
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-social-card-body';
      } else {
        return;
      }
      li.append(cell);
    });
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]));
  });
  block.replaceChildren(ul);
}
