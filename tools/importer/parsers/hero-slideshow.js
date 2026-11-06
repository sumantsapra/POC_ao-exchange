/* eslint-disable */
/* global WebImporter */

/**
 * hero-slideshow (homepage #hero).
 * Row 1: stacked slideshow images (top first) + link to the background MP4.
 * Row 2: H1 title + paragraph with "Scroll to explore" (#intro) and "Skip intro" (#summary) links.
 * Framer class hashes are not used: images are every non-data <img> in the block,
 * the title is the first heading that is not inside a link, the controls are the in-page links.
 */
function sentenceCase(text) {
  const t = (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function videoSrc(el) {
  const video = el.querySelector('video[src], video source[src]');
  if (video) return video.getAttribute('src');
  const link = [...el.querySelectorAll('a[href]')].find((a) => /\.mp4(\?|$)/i.test(a.getAttribute('href')));
  return link ? link.getAttribute('href') : '';
}

export default function parse(element, { document }) {
  // media row
  const mediaCell = [];
  const photos = [];
  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return;
    if (img.closest('a')) return; // arrow icon inside the scroll control
    const pic = document.createElement('img');
    pic.src = imgSrc(img);
    pic.alt = img.getAttribute('alt') || '';
    photos.push(pic);
  });
  // the source DOM lists the top photo last; author them top first, so the photo that shows
  // first is also the page's first image (loaded eagerly by Edge Delivery)
  mediaCell.push(...photos.reverse());
  const mp4 = videoSrc(element);
  if (mp4) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = mp4;
    a.textContent = mp4;
    p.append(a);
    mediaCell.push(p);
  }

  // content row
  const contentCell = [];
  const heading = [...element.querySelectorAll('h1, h2, h3, h4, h5, h6')].find((h) => !h.closest('a'));
  if (heading) {
    const h1 = document.createElement('h1');
    h1.textContent = textOf(heading);
    contentCell.push(h1);
  }
  const links = [...element.querySelectorAll('a[href]')]
    .filter((a) => /#/.test(a.getAttribute('href') || '') && a.textContent.trim());
  if (links.length) {
    const p = document.createElement('p');
    links.forEach((src, i) => {
      const href = src.getAttribute('href').replace(/^\.?\/?(?=#)/, '');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = sentenceCase(src.textContent);
      if (i) p.append(' ');
      p.append(a);
    });
    contentCell.push(p);
  }

  const cells = [[mediaCell]];
  if (contentCell.length) cells.push([contentCell]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-slideshow', cells });
  element.replaceWith(block);
}
