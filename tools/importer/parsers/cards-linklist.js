/* eslint-disable */
/* global WebImporter */

/**
 * cards-linklist (homepage #summary toolkit chapters).
 * Each row: [paragraph with a link to the chapter]. Link text = the chapter heading inside
 * the Framer link card; the arrow icon is added by the block.
 * "./slug" hrefs become "/slug"; the "Brand sound" row that points at the homepage in the
 * source is corrected to /brand-sound (also done by the cleanup transformer).
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function normaliseHref(href, label) {
  let h = (href || '').trim();
  try {
    const u = new URL(h, 'https://aobrandplaybook.com.au/');
    if (u.hostname === 'aobrandplaybook.com.au') h = u.pathname + u.search + u.hash;
  } catch (e) { /* keep as is */ }
  if ((h === '/' || h === '') && label.toLowerCase() === 'brand sound') h = '/brand-sound';
  return h;
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  element.querySelectorAll('a[href]').forEach((source) => {
    const heading = source.querySelector('h1, h2, h3, h4, h5, h6, p');
    const label = heading ? textOf(heading) : textOf(source);
    if (!label) return;
    const href = normaliseHref(source.getAttribute('href'), label);
    const key = `${label}|${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
    cells.push([p]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-linklist', cells });
  element.replaceWith(block);
}
