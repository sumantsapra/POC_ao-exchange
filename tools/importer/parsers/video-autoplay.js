/* eslint-disable */
/* global WebImporter */

/**
 * video-autoplay (in-page autoplay videos on guideline-chapter and sub-brand-guide pages).
 * One row, one cell: optional poster image, then a link to the MP4 (Framer <video src>).
 * Option "wide": a ~2:1 video whose frame follows the video's aspect ratio (e.g. /ao-live logo +
 * kinetic type videos, 1400x700) instead of the fixed-height frame. The intrinsic size comes from
 * the import script's onLoad (data-excat-video-width / -height; the video elements the parser
 * sees are fresh, unloaded copies whose frame collapses to the 150px placeholder height when it
 * is sized by the video). Without a known size the video is not classified.
 */
function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

/**
 * Wide: the video is ~2:1 and its frame follows the video (height from the video's aspect ratio),
 * not a fixed-height frame that happens to be 2:1 at the import width (/ao-shop: 1200x750 video in
 * a 700px / 450px / 250px tall frame).
 */
function isWide(video) {
  if (!video || typeof video.getBoundingClientRect !== 'function') return false;
  const w = video.videoWidth || parseFloat(video.getAttribute('data-excat-video-width')) || 0;
  const h = video.videoHeight || parseFloat(video.getAttribute('data-excat-video-height')) || 0;
  if (!w || !h || Math.abs(w / h - 2) > 0.12) return false;
  const r = video.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  // unloaded copy: the 150px placeholder height means the frame is sized by the video
  if (!video.videoWidth && Math.round(r.height) <= 150) return true;
  return Math.abs(r.width / r.height - w / h) <= 0.05;
}

export default function parse(element, { document }) {
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

  const cell = [];
  const posterUrl = video && video.getAttribute('poster');
  const posterImg = [...element.querySelectorAll('img')].find((i) => !(i.getAttribute('src') || '').startsWith('data:'));
  if (posterUrl || posterImg) {
    const img = document.createElement('img');
    img.src = posterUrl || imgSrc(posterImg);
    img.alt = (posterImg && posterImg.getAttribute('alt')) || '';
    cell.push(img);
  }
  if (src) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;
    p.append(a);
    cell.push(p);
  }

  const cells = [[cell]];
  const name = isWide(video) ? 'video-autoplay (wide)' : 'video-autoplay';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
