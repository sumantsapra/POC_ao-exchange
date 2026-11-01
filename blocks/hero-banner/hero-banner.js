import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_RE = /\.(mp4|webm|mov)(\?.*)?$/i;

function optimize(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]));
  });
}

function buildVideo(href, poster) {
  const video = document.createElement('video');
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'metadata');
  video.setAttribute('aria-hidden', 'true');
  if (poster) video.poster = poster;
  const source = document.createElement('source');
  source.src = href;
  source.type = `video/${(href.match(VIDEO_RE)?.[1] || 'mp4').toLowerCase().replace('mov', 'mp4')}`;
  video.append(source);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.autoplay = false;
    video.removeAttribute('autoplay');
  }
  return video;
}

/**
 * Hero banner: full-bleed photo or autoplay muted looping video, optional text row.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const mediaRow = rows.shift();
  if (!mediaRow) return;
  mediaRow.className = 'hero-banner-media';

  const link = [...mediaRow.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href));
  if (link) {
    const img = mediaRow.querySelector('img');
    const video = buildVideo(link.href, img?.src);
    mediaRow.textContent = '';
    mediaRow.append(video);
  } else {
    optimize(mediaRow);
  }

  rows.forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img, picture')) {
      row.remove();
      return;
    }
    row.className = 'hero-banner-content';
  });
}
