import { createOptimizedPicture } from '../../scripts/aem.js';

// tile height in px once fully collapsed into a bar
const COLLAPSED = 40;

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/**
 * Columns tiles: tall side-by-side tiles (logo + label) that shrink to slim bars on scroll.
 * One row; each cell = one tile. Tiles get an order class (columns-tiles-tile-1 ...) for colour.
 * @param {Element} block
 */
export default function decorate(block) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  const wrap = document.createElement('div');
  wrap.className = 'columns-tiles-row';
  block.classList.add(`columns-tiles-${cells.length}-cols`);

  cells.forEach((cell, i) => {
    const tile = document.createElement('div');
    tile.className = `columns-tiles-tile columns-tiles-tile-${i + 1}`;
    const picture = cell.querySelector('picture');
    if (picture) {
      const logo = document.createElement('div');
      logo.className = 'columns-tiles-logo';
      const wrapper = picture.parentElement;
      logo.append(picture);
      if (wrapper && wrapper !== cell && !wrapper.textContent.trim() && !wrapper.children.length) {
        wrapper.remove();
      }
      tile.append(logo);
    }
    const label = document.createElement('div');
    label.className = 'columns-tiles-label';
    label.append(...cell.childNodes);
    if (label.textContent.trim()) tile.append(label);
    wrap.append(tile);
  });

  optimizePictures(wrap);
  block.replaceChildren(wrap);

  if (reduceMotion || !('IntersectionObserver' in window)) return;

  // --columns-tiles-collapse: 0 = full height, 1 = collapsed bar.
  // Driven by the block's top moving from 75% to 15% of the viewport.
  // Uses the block's top, which does not depend on its own (changing) height.
  let ticking = false;
  let inView = false;
  const update = () => {
    ticking = false;
    if (!inView) return;
    const vh = window.innerHeight;
    const { top } = block.getBoundingClientRect();
    const collapse = Math.min(Math.max((vh * 0.75 - top) / (vh * 0.6), 0), 1);
    block.style.setProperty('--columns-tiles-collapse', collapse.toFixed(4));
    block.classList.toggle('is-collapsed', collapse >= 1);
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  block.classList.add('is-scroll-collapse');
  block.style.setProperty('--columns-tiles-collapsed-height', `${COLLAPSED}px`);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) update();
  }).observe(block);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
