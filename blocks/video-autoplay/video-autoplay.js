/*
 * Video Autoplay
 * Silent, looping, inline MP4 with no controls, loaded when it scrolls into view.
 * Authoring: one cell holding a link to the MP4, optionally preceded by a poster image.
 * With prefers-reduced-motion the video does not autoplay; it shows controls instead.
 * Option "wide" (block variant): 2:1 frame instead of the fixed-height frame (CSS only).
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function getVideoType(src) {
  const ext = new URL(src, window.location.href).pathname.split('.').pop().toLowerCase();
  if (ext === 'webm') return 'video/webm';
  if (ext === 'ogg' || ext === 'ogv') return 'video/ogg';
  return 'video/mp4';
}

function buildVideo(src, posterSrc) {
  const video = document.createElement('video');
  video.muted = true;
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'metadata');
  video.setAttribute('aria-hidden', 'true');
  if (posterSrc) video.setAttribute('poster', posterSrc);
  if (prefersReducedMotion.matches) {
    video.setAttribute('controls', '');
    video.removeAttribute('aria-hidden');
  } else {
    video.setAttribute('autoplay', '');
  }
  const source = document.createElement('source');
  source.src = src;
  source.type = getVideoType(src);
  video.append(source);
  return video;
}

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  const src = link ? link.href : '';
  const posterImg = block.querySelector('picture img, img');
  const poster = posterImg ? posterImg.closest('picture') || posterImg : null;

  block.textContent = '';
  if (!src) return;

  const frame = document.createElement('div');
  frame.className = 'video-autoplay-frame';
  if (poster) {
    poster.classList.add('video-autoplay-poster');
    frame.append(poster);
  }
  block.append(frame);
  block.dataset.embedLoaded = 'false';

  const load = () => {
    const video = buildVideo(src, posterImg ? posterImg.currentSrc || posterImg.src : '');
    video.addEventListener('loadeddata', () => {
      block.dataset.embedLoaded = 'true';
    }, { once: true });
    frame.append(video);
    if (!prefersReducedMotion.matches) {
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {});
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px' });
  observer.observe(block);
}
