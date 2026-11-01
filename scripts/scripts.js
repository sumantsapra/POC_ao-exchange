import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Loads the font stylesheet.
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    // sessionStorage can be blocked; fonts still load.
  }
}

/**
 * Turns a bold link into a button. Edge Delivery authors use this in documents.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();
    if (a.querySelector('img') || p.textContent.trim() !== text) return;
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;
    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) {
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * The source site picks heading levels for their look: section headings are h6 straight after the
 * page h1, homepage labels are h5. Renumber the headings in main so levels never skip (each
 * authored level is mapped to at most one deeper than the heading before its first use), and keep
 * the authored level as a heading-hN class, which the styles size from.
 * @param {Element} main The main element
 */
function normalizeHeadingLevels(main) {
  const levels = new Map();
  let previous = 0;
  main.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const authored = Number(heading.tagName[1]);
    if (!levels.has(authored)) levels.set(authored, Math.min(authored, previous + 1));
    const level = Math.min(levels.get(authored), previous + 1);
    previous = level;
    heading.classList.add(`heading-h${authored}`);
    if (level === authored) return;
    const renumbered = document.createElement(`h${level}`);
    [...heading.attributes].forEach(({ name, value }) => renumbered.setAttribute(name, value));
    renumbered.append(...heading.childNodes);
    heading.replaceWith(renumbered);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  decorateSections(main);
  normalizeHeadingLevels(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Chapter pages open with a title section without an image, so the LCP image is the first image
 * of the next section: load it eagerly and at high priority instead of lazily.
 * @param {Element} main The main element
 */
function prioritizeLcpImage(main) {
  const [first, second] = main.querySelectorAll(':scope > .section');
  if (!first || !second || first.querySelector('img')) return;
  const img = second.querySelector('img');
  if (!img) return;
  img.loading = 'eager';
  img.fetchPriority = 'high';
}

/**
 * Loads everything needed for the first view.
 * @param {Document} doc The document
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    prioritizeLcpImage(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // ignore storage failures
  }
}

/**
 * Loads the rest of the page.
 * @param {Document} doc The document
 */
async function loadLazy(doc) {
  const header = doc.querySelector('body > header');
  if (header) loadHeader(header);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const footer = doc.querySelector('body > footer');
  if (footer) loadFooter(footer);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
}

loadPage();
