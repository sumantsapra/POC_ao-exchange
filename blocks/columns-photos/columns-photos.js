import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns: photos.
 * Each row is a row of equal-width photos (any number of cells). Several rows of two
 * give a 2x2 grid. Rows stack to a single column on mobile.
 * A cell may hold a "Position: <value>" line (e.g. "Position: top"): the line is hidden and the
 * photo is cropped from that point (CSS object-position) instead of its centre.
 * A cell holding only a link to an MP4 is a video tile (muted autoplay loop, cropped like a photo).
 */
const POSITION_RE = /^position\s*:\s*(.+)$/i;
const VIDEO_RE = /\.(mp4|webm|mov)(\?.*)?$/i;

/** Muted autoplay loop for a gallery video tile (paused for reduced motion). */
function buildVideo(href) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  ['muted', 'loop', 'playsinline'].forEach((a) => video.setAttribute(a, ''));
  video.setAttribute('preload', 'metadata');
  video.setAttribute('aria-hidden', 'true');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.autoplay = true;
    video.setAttribute('autoplay', '');
  }
  const source = document.createElement('source');
  source.src = href;
  source.type = 'video/mp4';
  video.append(source);
  return video;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-photos-row');
    const cells = [...row.children];
    row.style.setProperty('--columns-photos-count', cells.length || 1);
    cells.forEach((cell) => {
      cell.classList.add('columns-photos-cell');
      [...cell.querySelectorAll('p')].forEach((p) => {
        const m = p.textContent.trim().match(POSITION_RE);
        if (!m || p.querySelector('picture, img')) return;
        cell.dataset.position = m[1].trim().toLowerCase();
        p.remove();
      });
      const link = [...cell.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href));
      if (link && !cell.querySelector('picture, img')) {
        cell.classList.add('columns-photos-video');
        cell.replaceChildren(buildVideo(link.href));
        return;
      }
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

  block.querySelectorAll('.columns-photos-cell[data-position]').forEach((cell) => {
    const img = cell.querySelector('img');
    if (img) img.style.objectPosition = cell.dataset.position;
  });
}
