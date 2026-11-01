const DESKTOP = window.matchMedia('(width >= 1200px)');
const HIDE_AFTER_PX = 100;

/**
 * Fetches the nav fragment. Local preview serves it under /content, DA/EDS at the root.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let path = '/content/nav.plain.html';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    path = '/nav.plain.html';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(path, window.location.href).href };
}

/**
 * Normalises a pathname so local (/content/colour.html) and live (/colour) paths compare equal.
 * @param {string} pathname
 * @returns {string}
 */
function normalisePath(pathname) {
  let path = pathname.replace(/^\/content(?=\/|$)/, '').replace(/\.html$/, '').replace(/\/index$/, '');
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

/**
 * Resolves fragment-relative image paths against the fragment URL.
 * @param {Element} root
 * @param {string} base
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
  });
}

/**
 * Wraps the nav fragment sections: brand (logo link), sections (link list), meta (text).
 * Sections are identified by content, not position.
 * @param {Element} fragment
 * @returns {{brand: Element|null, sections: Element|null, meta: Element|null}}
 */
function classifySections(fragment) {
  const parts = [...fragment.children];
  const brand = parts.find((part) => part.querySelector('img') && part.querySelector('a'));
  const sections = parts.find((part) => part !== brand && part.querySelector('ul'));
  const meta = parts.find((part) => part !== brand && part !== sections);
  return { brand, sections, meta };
}

/**
 * Wraps the bare text of each link in a span so label typography can be styled separately
 * from the link box.
 * @param {Element} root
 */
function wrapLabels(root) {
  root.querySelectorAll('a').forEach((a) => {
    [...a.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const span = document.createElement('span');
        span.textContent = node.textContent.trim();
        node.replaceWith(span);
      }
    });
  });
}

/**
 * Marks the link matching the current page with aria-current.
 * @param {Element} list
 */
function markCurrent(list) {
  const current = normalisePath(window.location.pathname);
  list.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    if (normalisePath(url.pathname) === current) a.setAttribute('aria-current', 'page');
  });
}

/**
 * Returns true when the colour is dark enough to need light text on top.
 * @param {string} color CSS rgb()/rgba() string
 * @returns {boolean|null} null when transparent
 */
function isDarkColor(color) {
  const m = color.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
  if (!m) return null;
  if (m[4] !== undefined && Number(m[4]) === 0) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.35;
}

/**
 * Detects whether what is painted behind a point is dark (dark fill, photo or video).
 * @param {number} x
 * @param {number} y
 * @param {Element} ignore the nav itself
 * @returns {boolean}
 */
function isDarkBehind(x, y, ignore) {
  const stack = document.elementsFromPoint(x, y).filter((el) => !ignore.contains(el));
  for (let i = 0; i < stack.length; i += 1) {
    const el = stack[i];
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'PICTURE') return true;
    const dark = isDarkColor(getComputedStyle(el).backgroundColor);
    if (dark !== null) return dark;
  }
  return false;
}

/**
 * Builds the in-page section nav from sections that carry nav-label section metadata.
 * @param {Element[]} sections
 * @returns {Element}
 */
function buildSectionNav(sections) {
  const nav = document.createElement('nav');
  nav.className = 'nav-page-sections';
  nav.setAttribute('aria-label', 'On this page');
  const list = document.createElement('ul');
  sections.forEach((section) => {
    const { anchor, navLabel } = section.dataset;
    if (anchor && !section.id) section.id = anchor;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${section.id || anchor}`;
    const label = document.createElement('span');
    label.textContent = navLabel;
    a.append(label);
    li.append(a);
    list.append(li);
  });
  nav.append(list);

  const links = [...list.querySelectorAll('a')];
  const setActive = (id) => links.forEach((a) => {
    if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
  // the active section is the last one whose top has passed the middle of the viewport
  let ticking = false;
  const update = () => {
    ticking = false;
    const middle = window.innerHeight / 2;
    let [active] = sections;
    sections.forEach((section) => {
      const box = section.getBoundingClientRect();
      // sections still hidden while their blocks load report a zero box: ignore them
      if (box.height > 0 && box.top <= middle) active = section;
    });
    const bottom = document.documentElement.scrollHeight - window.innerHeight - 2;
    if (window.scrollY > 0 && window.scrollY >= bottom) active = sections[sections.length - 1];
    setActive(active.id);
  };
  const schedule = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  sections.forEach((section) => new ResizeObserver(schedule).observe(section));
  update();
  return nav;
}

/**
 * Keeps the section nav legible: switches to light text over dark backgrounds.
 * @param {Element} nav
 */
function watchContrast(nav) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const link = nav.querySelector('a');
    if (!link || !DESKTOP.matches) return;
    const box = link.getBoundingClientRect();
    nav.classList.toggle('is-inverted', isDarkBehind(box.left + 2, box.top + box.height / 2, nav));
  };
  const schedule = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}

/**
 * Hides the logo bar once the page scrolls past the top (homepage behaviour).
 * @param {Element} bar
 */
function hideOnScroll(bar) {
  const update = () => bar.classList.toggle('is-hidden', window.scrollY > HIDE_AFTER_PX);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/**
 * Opens or closes the small-screen menu.
 * @param {Element} navWrapper
 * @param {Element} toggle
 * @param {boolean} open
 */
function setMenuOpen(navWrapper, toggle, open) {
  navWrapper.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

/**
 * Builds the small-screen menu toggle (two bars that morph into a cross).
 * @param {Element} navWrapper
 * @param {Element} panel element the toggle controls
 * @returns {Element}
 */
function buildToggle(navWrapper, panel) {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-controls', panel.id);
  toggle.innerHTML = '<span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>';
  setMenuOpen(navWrapper, toggle, false);
  toggle.addEventListener('click', () => {
    setMenuOpen(navWrapper, toggle, !navWrapper.classList.contains('is-open'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navWrapper.classList.contains('is-open')) {
      setMenuOpen(navWrapper, toggle, false);
      toggle.focus();
    }
  });
  // crossing into the desktop layout always resets the small-screen menu
  DESKTOP.addEventListener('change', () => setMenuOpen(navWrapper, toggle, false));
  return toggle;
}

/**
 * Decorates the header: chapter sidebar on content pages, logo bar + section nav on the
 * homepage (detected by sections carrying nav-label section metadata).
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const nav = await fetchNav();
  if (!nav) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = nav.html;
  resolveImages(fragment, nav.base);
  wrapLabels(fragment);
  const { brand, sections, meta } = classifySections(fragment);

  const wrapper = document.createElement('nav');
  wrapper.id = 'nav';
  wrapper.setAttribute('aria-label', 'Playbook');

  if (brand) {
    brand.className = 'nav-brand';
    wrapper.append(brand);
  }
  // chapter list + edition note: a sidebar on desktop, the expandable menu on small screens
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = 'nav-panel';
  const panelInner = document.createElement('div');
  panelInner.className = 'nav-panel-inner';
  if (sections) {
    sections.className = 'nav-sections';
    markCurrent(sections);
    panelInner.append(sections);
  }
  if (meta) {
    meta.className = 'nav-meta';
    panelInner.append(meta);
  }
  panel.append(panelInner);
  wrapper.append(panel);

  block.textContent = '';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(wrapper);
  wrapper.insertBefore(buildToggle(navWrapper, panel), panel);
  block.append(navWrapper);

  const pageSections = [...document.querySelectorAll('main .section[data-nav-label]')];
  if (pageSections.length) {
    block.classList.add('header-home');
    document.body.classList.add('has-page-sections');
    const sectionNav = buildSectionNav(pageSections);
    block.append(sectionNav);
    hideOnScroll(navWrapper);
    watchContrast(sectionNav);
  } else {
    block.classList.add('header-sidebar');
    document.body.classList.add('has-nav-sidebar');
  }
}
