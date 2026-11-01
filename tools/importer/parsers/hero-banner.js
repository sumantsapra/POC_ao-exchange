/* eslint-disable */
/* global WebImporter */

/**
 * hero-banner (sub-brand-guide full-bleed banner, e.g. /ao-live).
 * Row 1: banner media: a photo, or optional poster + link to the MP4 (Framer <video src>).
 * Row 2 (optional): heading / text when the banner carries any (absent on /ao-live).
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

export default function parse(element, { document }) {
  const media = [];
  const video = element.querySelector('video');
  let src = '';
  if (video) {
    src = video.getAttribute('src')
      || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src')) || '';
  }
  if (!src) {
    const link = [...element.querySelectorAll('a[href]')].find((a) => /\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute('href')));
    if (link) src = link.getAttribute('href');
  }
  const posterUrl = video && video.getAttribute('poster');
  const firstImg = [...element.querySelectorAll('img')].find((i) => !(i.getAttribute('src') || '').startsWith('data:'));
  if (posterUrl || firstImg) {
    const img = document.createElement('img');
    img.src = posterUrl || imgSrc(firstImg);
    img.alt = (firstImg && firstImg.getAttribute('alt')) || '';
    media.push(img);
  }
  if (src) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;
    p.append(a);
    media.push(p);
  }

  const cells = [[media]];

  // optional text row
  const text = [];
  element.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((node) => {
    if (node.parentElement.closest('h1, h2, h3, h4, h5, h6, p')) return;
    const t = textOf(node);
    if (!t) return;
    const el = document.createElement(node.tagName.toLowerCase());
    el.textContent = t;
    text.push(el);
  });
  if (text.length) cells.push([text]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
