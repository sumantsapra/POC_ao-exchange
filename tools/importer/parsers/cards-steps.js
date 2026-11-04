/* eslint-disable */
/* global WebImporter */

/**
 * cards-steps (/partner-guidelines "Approval process": Submit / Review / Iterate).
 * Cards convention: one row per card, two cells:
 *   [step icon (the numbered circle) | step title (heading, level kept) + description].
 * The detector hands over the first step tile of a run; the following sibling step tiles
 * (same shape: [small icon | title + description]) belong to the same block and are removed.
 */
const TEXT_SEL = 'h1, h2, h3, h4, h5, h6, p, li';

function collapse(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function contentImages(el) {
  return [...el.querySelectorAll('img')].filter((img) => {
    const src = img.getAttribute('src') || '';
    return src && (!src.startsWith('data:') || src.startsWith('data:image/svg+xml'));
  });
}

function hasContent(el) {
  return !!collapse(el.textContent) || contentImages(el).length > 0;
}

function texts(el) {
  return [...el.querySelectorAll(TEXT_SEL)]
    .filter((t) => !t.parentElement.closest(TEXT_SEL) && collapse(t.textContent));
}

/** Same shape as the detector's step tile: two content children, icon first, one heading. */
function isStep(el) {
  if (!el || el.tagName === 'SECTION') return false;
  const kids = [...el.children].filter(hasContent);
  if (kids.length !== 2) return false;
  const [icon, text] = kids;
  return contentImages(icon).length === 1 && !collapse(icon.textContent)
    && !contentImages(text).length && text.querySelectorAll('h1, h2, h3, h4, h5, h6').length === 1;
}

function nextContentSibling(el) {
  let n = el.nextElementSibling;
  while (n && !hasContent(n)) n = n.nextElementSibling;
  return n;
}

export default function parse(element, { document }) {
  const steps = [element];
  for (let n = nextContentSibling(element); isStep(n); n = nextContentSibling(n)) steps.push(n);

  const cells = steps.map((step) => {
    const [icon, text] = [...step.children].filter(hasContent);
    const source = contentImages(icon)[0];
    const img = document.createElement('img');
    img.src = imgSrc(source);
    img.alt = source.getAttribute('alt') || '';
    const body = texts(text).map((t) => {
      const out = document.createElement(/^H[1-6]$/.test(t.tagName) ? t.tagName.toLowerCase() : 'p');
      out.textContent = collapse(t.textContent);
      return out;
    });
    return [img, body];
  });

  steps.slice(1).forEach((s) => s.remove());
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-steps', cells });
  element.replaceWith(block);
}
