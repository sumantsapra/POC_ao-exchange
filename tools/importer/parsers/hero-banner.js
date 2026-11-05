/* eslint-disable */
/* global WebImporter */

/**
 * hero-banner (sub-brand-guide full-bleed banner, e.g. /ao-live).
 * Row 1: banner media: a photo, or optional poster + link to the MP4 (Framer <video src>).
 * Row 2 (optional): heading / text laid over the banner (/partner-guidelines "Partner
 *   guidelines" title). The detector hands over the media wrapper only; text of the same band
 *   that renders on top of the media is part of the banner and is moved into this row.
 * Option "short": the band is clearly shorter than the usual 800px desktop banner
 *   (/ao-reserve: 600px at >= 1200px, letterboxed under the bar on mobile). Measured on the live
 *   page (the importer renders at desktop width).
 * Option "tall": at tablet widths (810-1199px) the band fills the window (/ao-reserve,
 *   /ao-ballpark, /partner-guidelines). The importer renders at desktop width, so the import
 *   script's onLoad measures the page in a 900x900 frame and flags the body
 *   (data-excat-hero-tablet-tall).
 */
const SHORT_MAX = 700; // px: usual banner 800px, short banner 600px

function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

function rectOf(el) {
  if (typeof el.getBoundingClientRect !== 'function') return null;
  const r = el.getBoundingClientRect();
  return r.width && r.height ? r : null;
}

function overlaps(a, b) {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/** Outermost text elements of the band (outside the media) that render over the media. */
function overlayTexts(element) {
  const band = element.closest('section');
  if (!band) return [];
  const media = rectOf(element) || rectOf(band);
  if (!media) return [];
  return [...band.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
    .filter((t) => !element.contains(t) && !t.parentElement.closest('h1, h2, h3, h4, h5, h6, p'))
    .filter((t) => textOf(t))
    .filter((t) => { const r = rectOf(t); return r && overlaps(r, media); });
}

/** Remove a moved text node and the wrappers it leaves empty (inside the band only). */
function removeWithWrappers(node, band) {
  let n = node;
  while (n.parentElement && n.parentElement !== band && n.parentElement.children.length === 1) n = n.parentElement;
  n.remove();
}

export default function parse(element, { document }) {
  const media = [];
  const video = element.querySelector('video');
  let src = '';
  if (video) {
    src = video.getAttribute('src')
      || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src')) || '';
  }
  if (!src) {
    const link = [...element.querySelectorAll('a[href]')].find((a) => /\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute('href')));
    if (link) src = link.getAttribute('href');
  }
  const posterUrl = video && video.getAttribute('poster');
  const firstImg = [...element.querySelectorAll('img')].find((i) => !(i.getAttribute('src') || '').startsWith('data:'));
  if (posterUrl || firstImg) {
    const img = document.createElement('img');
    img.src = posterUrl || imgSrc(firstImg);
    img.alt = (firstImg && firstImg.getAttribute('alt')) || '';
    media.push(img);
  }
  if (src) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = src;
    a.textContent = src;
    p.append(a);
    media.push(p);
  }

  const cells = [[media]];

  // option: banner height of the live band
  const band = element.closest('section');
  const bandRect = band && rectOf(band);
  const options = [];
  if (bandRect && bandRect.height < SHORT_MAX) options.push('short');
  if (document.body && document.body.getAttribute('data-excat-hero-tablet-tall') === 'true') options.push('tall');

  // optional text row: text inside the media wrapper, then band text laid over the media
  const text = [];
  const sources = [
    ...[...element.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
      .filter((node) => !node.parentElement.closest('h1, h2, h3, h4, h5, h6, p')),
    ...overlayTexts(element),
  ];
  sources.forEach((node) => {
    const t = textOf(node);
    if (!t) return;
    const el = document.createElement(node.tagName.toLowerCase());
    el.textContent = t;
    text.push(el);
    if (!element.contains(node) && band) removeWithWrappers(node, band);
  });
  if (text.length) cells.push([text]);

  const name = options.length ? `hero-banner (${options.join(', ')})` : 'hero-banner';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
