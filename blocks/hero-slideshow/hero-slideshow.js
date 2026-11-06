import { createOptimizedPicture } from '../../scripts/aem.js';

const SLIDE_DURATION = 2500;

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]));
  });
}

function buildVideo(href) {
  const video = document.createElement('video');
  video.className = 'hero-slideshow-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'metadata';
  video.src = href;
  return video;
}

/**
 * Hero slideshow: stacked photos fade out one by one to reveal a looping background video.
 * Row 1: pictures (first one on top) + optional video link. Row 2: title + scroll/skip links.
 * @param {Element} block
 */
export default function decorate(block) {
  const [mediaRow, contentRow] = [...block.children];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const media = document.createElement('div');
  media.className = 'hero-slideshow-media';

  let video = null;
  const layers = [];
  if (mediaRow) {
    const link = mediaRow.querySelector('a[href]');
    if (link) video = buildVideo(link.href);
    mediaRow.querySelectorAll('picture').forEach((pic) => {
      const layer = document.createElement('div');
      layer.className = 'hero-slideshow-slide';
      layer.append(pic);
      layers.push(layer);
    });
  }
  if (video) media.append(video);
  // the first authored picture sits on top and fades out first
  layers.forEach((layer, i) => {
    layer.style.zIndex = String(layers.length - i);
    media.append(layer);
  });
  optimizePictures(media);
  // the top photo is the page's largest paint: fetch it first
  const top = layers[0] && layers[0].querySelector('img');
  if (top) {
    top.loading = 'eager';
    top.fetchPriority = 'high';
  }

  const content = document.createElement('div');
  content.className = 'hero-slideshow-content';
  const controls = document.createElement('div');
  controls.className = 'hero-slideshow-controls';
  if (contentRow) {
    const cell = contentRow.firstElementChild || contentRow;
    const links = [...cell.querySelectorAll('a[href]')];
    links.forEach((a, i) => {
      a.closest('p')?.classList.add('hero-slideshow-links');
      if (i === 0) {
        a.classList.add('hero-slideshow-scroll');
        const icon = document.createElement('span');
        icon.className = 'hero-slideshow-scroll-icon';
        icon.setAttribute('aria-hidden', 'true');
        a.append(icon);
      } else {
        a.classList.add('hero-slideshow-skip');
        controls.append(a);
      }
    });
    content.append(...cell.childNodes);
    content.querySelectorAll('.hero-slideshow-links').forEach((p) => {
      if (!p.textContent.trim()) p.remove();
    });
  }

  block.replaceChildren(media, content);
  if (controls.children.length) block.append(controls);

  if (reduceMotion || (!layers.length && !video)) {
    block.classList.add('is-static');
    return;
  }

  let index = 0;
  let timer = null;
  let visible = false;

  const step = () => {
    if (index < layers.length) {
      layers[index].classList.add('is-hidden');
      index += 1;
    } else if (!video) {
      // no video to reveal: restart the photo cycle
      layers.forEach((l) => l.classList.remove('is-hidden'));
      index = 0;
    }
    if (index >= layers.length && video) {
      clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    if (video) video.play().catch(() => {});
    if (!timer && (index < layers.length || !video)) timer = setInterval(step, SLIDE_DURATION);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
    if (video) video.pause();
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0.1 }).observe(block);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (visible) start();
  });
}
