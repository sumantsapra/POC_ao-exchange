import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });
}

let instance = 0;

/**
 * Accordion photo: pinned panel; scroll position (or a click) selects the active item,
 * whose photo becomes the full-bleed backdrop. Items are numbered 01., 02. ... by the block.
 * Optional first row with a single cell: the eyebrow, shown as a pill above the items.
 * Each other row: cell 1 title, cell 2 picture + description.
 * @param {Element} block
 */
export default function decorate(block) {
  instance += 1;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rows = [...block.children];

  const track = document.createElement('div');
  track.className = 'accordion-photo-track';
  const panel = document.createElement('div');
  panel.className = 'accordion-photo-panel';
  const backdrops = document.createElement('div');
  backdrops.className = 'accordion-photo-backdrops';
  const content = document.createElement('div');
  content.className = 'accordion-photo-content';
  const list = document.createElement('ol');
  list.className = 'accordion-photo-items';

  const [firstRow] = rows;
  if (firstRow && firstRow.children.length === 1 && firstRow.textContent.trim()
    && !firstRow.querySelector('picture, img')) {
    rows.shift();
    const eyebrow = document.createElement('p');
    eyebrow.className = 'accordion-photo-eyebrow';
    eyebrow.textContent = firstRow.textContent.trim();
    content.append(eyebrow);
  }

  const items = rows.map((row, i) => {
    const [titleCell, contentCell] = [...row.children];
    const id = `accordion-photo-${instance}-${i}`;

    const backdrop = document.createElement('div');
    backdrop.className = 'accordion-photo-backdrop';
    const picture = contentCell?.querySelector('picture');
    if (picture) {
      const wrapper = picture.parentElement;
      backdrop.append(picture);
      // drop the now-empty paragraph EDS wraps pictures in
      if (wrapper && wrapper !== contentCell && wrapper.tagName === 'P' && !wrapper.textContent.trim()
        && !wrapper.querySelector('img, video')) wrapper.remove();
    }
    backdrops.append(backdrop);

    const li = document.createElement('li');
    li.className = 'accordion-photo-item';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-photo-title';
    button.id = `${id}-title`;
    button.setAttribute('aria-controls', `${id}-body`);
    const num = document.createElement('span');
    num.className = 'accordion-photo-number';
    num.textContent = `${String(i + 1).padStart(2, '0')}.`;
    const label = document.createElement('span');
    label.className = 'accordion-photo-label';
    label.append(...(titleCell ? titleCell.childNodes : []));
    button.append(num, label);

    const body = document.createElement('div');
    body.className = 'accordion-photo-body';
    body.id = `${id}-body`;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', button.id);
    if (contentCell) body.append(...contentCell.childNodes);

    li.append(button, body);
    list.append(li);
    return {
      li, button, body, backdrop,
    };
  });

  optimizePictures(backdrops);
  content.append(list);
  panel.append(backdrops, content);
  track.append(panel);
  block.replaceChildren(track);
  block.style.setProperty('--accordion-photo-count', items.length || 1);

  let active = -1;
  const activate = (index) => {
    if (index === active) return;
    items.forEach((item, i) => {
      const on = i === index;
      item.li.classList.toggle('is-active', on);
      item.backdrop.classList.toggle('is-active', on);
      item.button.setAttribute('aria-expanded', String(on));
      item.body.hidden = !on;
    });
    active = index;
  };
  activate(0);

  const pinned = !reduceMotion && items.length > 1;
  if (!pinned) block.classList.add('is-static');

  items.forEach((item, i) => {
    item.button.addEventListener('click', () => {
      activate(i);
      if (!pinned) return;
      // move the scroll position into this item's slice of the track so scroll and state agree
      const rect = track.getBoundingClientRect();
      const range = track.offsetHeight - window.innerHeight;
      const target = window.scrollY + rect.top + (range * (i + 0.5)) / items.length;
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  if (!pinned) return;

  let ticking = false;
  let inView = false;
  const update = () => {
    ticking = false;
    if (!inView) return;
    const rect = track.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    if (range <= 0) return;
    const progress = Math.min(Math.max(-rect.top / range, 0), 0.9999);
    block.style.setProperty('--accordion-photo-progress', progress.toFixed(4));
    activate(Math.floor(progress * items.length));
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
  }).observe(track);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
