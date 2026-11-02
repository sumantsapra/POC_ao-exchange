import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]));
  });
}

function buildVideo(href, reduceMotion) {
  const video = document.createElement('video');
  video.className = 'carousel-stack-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.preload = 'none';
  if (reduceMotion) video.controls = true;
  // the source is attached when the block nears the viewport (see loadVideosWhenNear)
  video.dataset.src = href;
  return video;
}

/**
 * Attaches each video's source once the block is within one viewport of the screen, so the
 * stack's videos are not downloaded while the visitor is still at the top of the page.
 * @param {Element} block
 * @param {HTMLVideoElement[]} videos
 */
function loadVideosWhenNear(block, videos) {
  const attach = () => videos.forEach((video) => {
    if (!video.dataset.src) return;
    video.src = video.dataset.src;
    delete video.dataset.src;
    video.preload = 'metadata';
  });
  if (!('IntersectionObserver' in window)) {
    attach();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    observer.disconnect();
    attach();
  }, { rootMargin: '100% 0px' });
  observer.observe(block);
}

/**
 * Carousel stack: media cards pin and stack over each other while scrolling.
 * Each row = one card. Cell 1: video link (any link is treated as a video) or picture.
 * Cell 2: caption.
 * @param {Element} block
 */
export default function decorate(block) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list = document.createElement('ul');
  list.className = 'carousel-stack-cards';
  const videos = [];

  [...block.children].forEach((row, i) => {
    const [mediaCell, captionCell] = [...row.children];
    const card = document.createElement('li');
    card.className = 'carousel-stack-card';
    card.style.setProperty('--carousel-stack-index', i);

    const media = document.createElement('div');
    media.className = 'carousel-stack-media';
    const picture = mediaCell?.querySelector('picture');
    const link = mediaCell?.querySelector('a[href]');
    if (link) {
      const video = buildVideo(link.href, reduceMotion);
      const label = link.textContent.trim();
      if (label && label !== link.href) video.setAttribute('aria-label', label);
      if (picture) {
        const img = picture.querySelector('img');
        if (img) video.poster = img.src;
      }
      media.append(video);
      videos.push(video);
    } else if (picture) {
      media.append(picture);
    }
    card.append(media);

    if (captionCell && captionCell.textContent.trim()) {
      const caption = document.createElement('div');
      caption.className = 'carousel-stack-caption';
      caption.append(...captionCell.childNodes);
      card.append(caption);
    }
    list.append(card);
  });

  optimizePictures(list);
  block.replaceChildren(list);
  loadVideosWhenNear(block, videos);

  if (reduceMotion) {
    block.classList.add('is-static');
    return;
  }

  if (!('IntersectionObserver' in window)) {
    videos.forEach((v) => { v.autoplay = true; });
    return;
  }

  // Stuck cards stay "in view" underneath later ones, so the front card is the last one
  // whose top has reached the middle of the viewport. Only that card's video plays.
  const cards = [...list.children];
  let active = -1;
  let ticking = false;
  let inView = false;

  const setActive = (next) => {
    if (next === active) return;
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === next);
      const video = card.querySelector('video');
      if (!video) return;
      if (i === next) video.play().catch(() => {});
      else video.pause();
    });
    active = next;
  };

  const update = () => {
    ticking = false;
    if (!inView) return;
    const mid = window.innerHeight / 2;
    let next = 0;
    cards.forEach((card, i) => {
      if (card.getBoundingClientRect().top <= mid) next = i;
    });
    setActive(next);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) update();
    else setActive(-1);
  }).observe(block);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
