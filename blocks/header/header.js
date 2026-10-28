const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/speakers', label: 'Speakers' },
];

function currentPath() {
  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path || '/';
}

/**
 * Builds the fixed pill navigation used on every page.
 * @param {Element} block Header block
 */
export default function decorate(block) {
  const path = currentPath();
  const nav = document.createElement('nav');
  nav.className = 'nav-pill';
  nav.setAttribute('aria-label', 'AO Exchange');

  const brand = document.createElement('a');
  brand.className = 'nav-brand';
  brand.href = '/';
  brand.innerHTML = '<img src="/media/ao-logo.png" alt="Australian Open">';

  const links = document.createElement('div');
  links.className = 'nav-links';
  LINKS.forEach((item, index) => {
    if (index > 0) {
      const dot = document.createElement('span');
      dot.className = 'nav-dot';
      dot.setAttribute('aria-hidden', 'true');
      links.append(dot);
    }
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    if (item.href === path) a.setAttribute('aria-current', 'page');
    links.append(a);
  });

  const cta = document.createElement('a');
  cta.className = 'nav-cta';
  cta.href = '/#form';
  cta.textContent = 'Register now';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.innerHTML = '<span></span><span></span>';
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  nav.append(brand, links, cta, toggle);
  block.replaceChildren(nav);
}
