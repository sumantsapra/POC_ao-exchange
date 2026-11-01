const ARROW_ICON = '<svg viewBox="0 0 32 32" width="32" height="32" focusable="false" aria-hidden="true">'
  + '<circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/>'
  + '<path d="M10 16h11M17 11l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" '
  + 'stroke-linecap="round" stroke-linejoin="round"/></svg>';

/**
 * Cards linklist: full-width text rows, each a link with an arrow icon added by the block.
 * Each row = one item; cell 1 holds the link. Rows reveal as they scroll into view.
 * @param {Element} block
 */
export default function decorate(block) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list = document.createElement('ul');
  list.className = 'cards-linklist-items';

  [...block.children].forEach((row) => {
    const cell = row.firstElementChild || row;
    const li = document.createElement('li');
    li.className = 'cards-linklist-item';
    const link = cell.querySelector('a[href]');
    if (link) {
      // the whole row is the link; keep the authored link text
      const a = document.createElement('a');
      a.className = 'cards-linklist-link';
      a.href = link.getAttribute('href');
      if (link.title) a.title = link.title;
      if (link.target) a.target = link.target;
      const label = document.createElement('span');
      label.className = 'cards-linklist-label';
      label.append(...link.childNodes);
      const icon = document.createElement('span');
      icon.className = 'cards-linklist-icon';
      icon.innerHTML = ARROW_ICON;
      a.append(label, icon);
      li.append(a);
    } else {
      const label = document.createElement('div');
      label.className = 'cards-linklist-label';
      label.append(...cell.childNodes);
      li.append(label);
    }
    list.append(li);
  });

  block.replaceChildren(list);

  if (reduceMotion || !('IntersectionObserver' in window)) return;

  block.classList.add('is-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  [...list.children].forEach((li) => io.observe(li));
}
