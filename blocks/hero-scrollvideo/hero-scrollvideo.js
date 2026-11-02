import { createOptimizedPicture } from '../../scripts/aem.js';

// Scroll progress (0..1) boundaries for the phases of the pinned lockup.
const PHASES = [
  { name: 'intro', end: 0.2 }, // captions flank the title
  { name: 'title', end: 0.3 }, // title alone
  { name: 'video', end: 0.8 }, // video grows to full-bleed, then shrinks back
  { name: 'outro', end: 1 }, // final caption below the title
];

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });
}

const isEyebrow = (el) => el.tagName === 'P'
  && el.children.length === 1
  && /^(STRONG|B)$/.test(el.firstElementChild.tagName)
  && el.textContent.trim() === el.firstElementChild.textContent.trim();

/** Groups elements into [eyebrow?, caption...] pairs, a new group starting at each eyebrow. */
function groupPairs(elements) {
  const groups = [];
  elements.forEach((el) => {
    if (isEyebrow(el) || !groups.length) groups.push([]);
    groups[groups.length - 1].push(el);
  });
  return groups;
}

function wrapGroup(className, groups) {
  const wrap = document.createElement('div');
  wrap.className = className;
  groups.forEach((group) => {
    const pair = document.createElement('div');
    pair.className = 'hero-scrollvideo-pair';
    group.forEach((el) => {
      if (isEyebrow(el)) el.classList.add('hero-scrollvideo-eyebrow');
      else el.classList.add('hero-scrollvideo-caption');
    });
    pair.append(...group);
    wrap.append(pair);
  });
  return wrap;
}

/**
 * Hero scroll video: pinned display title; captions phase in around it while a video
 * scales from a card to full-bleed behind it and back.
 * Row 1: video link (or picture). Row 2: eyebrow/caption pairs, heading, more pairs.
 * @param {Element} block
 */
export default function decorate(block) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [mediaRow, contentRow] = [...block.children];

  const media = document.createElement('div');
  media.className = 'hero-scrollvideo-media';
  let video = null;
  const link = mediaRow?.querySelector('a[href]');
  if (link) {
    video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'none';
    if (reduceMotion) video.controls = true;
    video.dataset.src = link.href;
    media.append(video);
  } else {
    const picture = mediaRow?.querySelector('picture');
    if (picture) media.append(picture);
  }
  optimizePictures(media);

  const lockup = document.createElement('div');
  lockup.className = 'hero-scrollvideo-lockup';
  const cell = contentRow?.firstElementChild || contentRow;
  const els = cell ? [...cell.children] : [];
  const headingIndex = els.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  if (headingIndex >= 0) {
    const heading = els[headingIndex];
    heading.classList.add('hero-scrollvideo-title');
    const before = groupPairs(els.slice(0, headingIndex));
    const after = groupPairs(els.slice(headingIndex + 1));
    // the last pair after the title is the outro caption when there is more than one
    const outro = after.length > 1 ? [after.pop()] : [];
    if (before.length) lockup.append(wrapGroup('hero-scrollvideo-before', before));
    lockup.append(heading);
    if (after.length) lockup.append(wrapGroup('hero-scrollvideo-after', after));
    if (outro.length) lockup.append(wrapGroup('hero-scrollvideo-outro', outro));
  } else {
    lockup.append(...els);
  }

  const stage = document.createElement('div');
  stage.className = 'hero-scrollvideo-stage';
  stage.append(media, lockup);
  const track = document.createElement('div');
  track.className = 'hero-scrollvideo-track';
  track.append(stage);
  block.replaceChildren(track);

  // the block sits far down the homepage: attach the video source once it is a viewport away
  if (video) {
    const attach = () => {
      video.src = video.dataset.src;
      delete video.dataset.src;
      video.preload = 'metadata';
    };
    if ('IntersectionObserver' in window) {
      const nearObserver = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        nearObserver.disconnect();
        attach();
      }, { rootMargin: '100% 0px' });
      nearObserver.observe(track);
    } else {
      attach();
    }
  }

  if (reduceMotion) {
    block.classList.add('is-static');
    return;
  }

  let phase = '';
  let ticking = false;
  let inView = false;

  const setPhase = (name) => {
    if (name === phase) return;
    phase = name;
    block.dataset.phase = name;
    if (!video) return;
    if (name === 'video') video.play().catch(() => {});
    else video.pause();
  };

  const update = () => {
    ticking = false;
    if (!inView) return;
    const rect = track.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    if (range <= 0) return;
    const progress = Math.min(Math.max(-rect.top / range, 0), 1);
    const current = PHASES.find((p) => progress <= p.end) || PHASES[PHASES.length - 1];
    setPhase(current.name);
    // 0 = card size, 1 = full-bleed; rises then falls across the video phase
    const start = PHASES[1].end;
    const { end } = PHASES[2];
    const t = Math.min(Math.max((progress - start) / (end - start), 0), 1);
    const grow = Math.sin(t * Math.PI);
    block.style.setProperty('--hero-scrollvideo-progress', progress.toFixed(4));
    block.style.setProperty('--hero-scrollvideo-grow', grow.toFixed(4));
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  setPhase('intro');
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) update();
    else if (video) video.pause();
  }).observe(track);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
