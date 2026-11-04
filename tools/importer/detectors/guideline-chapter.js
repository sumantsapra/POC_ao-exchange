/* eslint-disable */
/* global WebImporter */

/**
 * Structure-based block detectors for the guideline-chapter template
 * (/colour, /brand-sound, /graphic-elements, /logos, /tone-of-voice, /typography).
 * cards-shape instances were captured on /graphic-elements.
 * Used by import-guideline-chapter.js when the /colour (and /logos) instance selectors from
 * page-templates.json do not match. Order matters: the first detector that accepts an element
 * wins and its subtree is not tested again.
 */
import {
  textOf,
  headings,
  textElements,
  contentChildren,
  contentImages,
  videos,
  isImageTile,
  isImageGrid,
  isLabelledImageTile,
  isPhoto,
  isGraphic,
  bandOf,
  uniformBleed,
  isSwatchGrid,
  isSwatchTile,
  isContrastGrid,
  isLogoContrastGrid,
  isMisuseGrid,
  isFramedGrid,
  isSideBySide,
  isTypefaceRow,
  isVideoContainer,
  isLayeredBand,
  contextOf,
  EXCLUSION_RE,
  LOCKUP_RE,
} from './common.js';

/* cards-gradient: tile = [name group | stops group], as the parser expects */
function unwrap(el) {
  let node = el;
  for (let kids = contentChildren(node); kids.length === 1; kids = contentChildren(node)) [node] = kids;
  return node;
}

function isGradientTile(el) {
  const kids = contentChildren(unwrap(el));
  if (kids.length !== 2) return false;
  const name = textElements(kids[0]);
  if (name.length !== 1 || !/gradient/i.test(textOf(name[0]))) return false;
  const stops = contentChildren(kids[1]);
  return stops.length >= 2 && stops.every((s) => textElements(s).length === 1 && textOf(s).split(' ').length <= 3);
}

function isGradientGrid(el) {
  const kids = contentChildren(el);
  return kids.length >= 1 && kids.every(isGradientTile);
}

/*
 * columns-photos: 2-8 photos side by side, no text. Icon / illustration sticker grids
 * (dozens of tiles, or small non-responsive images) and exclusion-zone artwork are not photos.
 */
function isPhotoRow(el, ctx) {
  if (!isImageGrid(el)) return false;
  const imgs = contentImages(el);
  if (imgs.length > 8 || !imgs.every(isPhoto) || !uniformBleed(imgs)) return false;
  const { heading } = contextOf(el, ctx);
  return !EXCLUSION_RE.test(heading);
}

/*
 * cards-logo (/logos Core Logo): 2-8 logo-version tiles, each one image + at most a short label,
 * under a logo heading.
 */
function isLogoVersionGrid(el, ctx) {
  const kids = contentChildren(el);
  if (kids.length < 2 || kids.length > 8 || !kids.every((k) => isLabelledImageTile(k))) return false;
  if (!kids.some((k) => textOf(k))) return false; // image-only pairs are framed lockups
  return LOCKUP_RE.test(contextOf(el, ctx).heading);
}

/* columns-panel (/logos Badge and Fav Icon): 2-6 text-less badge / icon images */
function isBadgePanel(el, ctx) {
  if (!isImageGrid(el)) return false;
  const n = contentImages(el).length;
  return n >= 2 && n <= 6 && /badge|fav ?icon|avatar|app icon/i.test(contextOf(el, ctx).heading);
}

/*
 * cards-shape (/graphic-elements icon and illustration groups): a grid of 3+ small graphics
 * (icons, stickers; optionally with a short label such as "Rod Laver Arena"), as on the
 * sub-brand pages; or, inside an icons / illustrations band, a group whose only artwork is a
 * single image (e.g. "Ball illustrations"). One block per group: the group heading stays
 * default content before it.
 */
const ICON_BAND_RE = /icon|illustration|sticker/i;

function isLabelledGrid(el) {
  const kids = contentChildren(el);
  return kids.length >= 2 && kids.every((k) => isLabelledImageTile(k));
}

function isShapeGrid(el) {
  if (!isImageGrid(el) && !isLabelledGrid(el)) return false;
  const imgs = contentImages(el);
  return imgs.length >= 3 && imgs.filter((i) => isGraphic(i)).length >= imgs.length * 0.75;
}

function isLoneGroupGraphic(el, ctx) {
  if (!isImageTile(el)) return false;
  const band = bandOf(el);
  if (!band || !ICON_BAND_RE.test(band.getAttribute('data-framer-name') || '')) return false;
  // the group: [heading part | this image], inside a band of groups
  const parent = el.parentElement;
  const siblings = parent ? contentChildren(parent).filter((c) => c !== el) : [];
  return siblings.length === 1 && headings(siblings[0]).length === 1 && !contentImages(siblings[0]).length
    && ICON_BAND_RE.test(contextOf(el, ctx).heading);
}

/* columns-text-image: [heading + copy | one image] side by side, or a lone such pair */
function textImageShape(el) {
  if (videos(el).length) return false;
  const kids = contentChildren(el);
  if (kids.length !== 2) return false;
  const img = kids.find(isImageTile);
  const text = kids.find((k) => k !== img);
  if (!img || !text) return false;
  return !contentImages(text).length && headings(text).length >= 1 && textElements(text).length >= 2;
}

function isTextImage(el) {
  if (!textImageShape(el)) return false;
  if (isSideBySide(el)) return true; // one-logo-per-row layout (e.g. /logos Vertical Core Logo)
  const parent = el.parentElement;
  const siblings = parent ? contentChildren(parent).filter((s) => s !== el) : [];
  return !siblings.some(textImageShape);
}

/*
 * /tone-of-voice text blocks. Painted = a non-transparent computed background on the element or
 * on its single-content-child chain (tiles / panels), or (panels) on one of its 3 nearest
 * ancestors below the section.
 */
const TRANSPARENT_RE = /^(transparent|rgba\(0, 0, 0, 0\))$/;

function bgOf(el) {
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return '';
  try { return view.getComputedStyle(el).backgroundColor || ''; } catch (e) { return ''; }
}

function isPainted(el) {
  for (let n = el, i = 0; n && i < 5; i += 1) {
    const bg = bgOf(n);
    if (bg && !TRANSPARENT_RE.test(bg)) return true;
    const k = contentChildren(n);
    n = k.length === 1 ? k[0] : null;
  }
  return false;
}

function inPaintedPanel(el) {
  for (let n = el, i = 0; n && i < 4 && n.tagName !== 'SECTION'; i += 1, n = n.parentElement) {
    const bg = bgOf(n);
    if (bg && !TRANSPARENT_RE.test(bg)) return true;
  }
  return false;
}

const words = (el) => textOf(el).split(' ').filter(Boolean).length;
const textOnly = (el) => !contentImages(el).length && !videos(el).length;

/* cards-principle: 2-8 painted text-only cards of [short heading | description] */
function isPrincipleCard(el) {
  if (!textOnly(el)) return false;
  const hs = headings(el);
  const texts = textElements(el);
  return hs.length === 1 && texts.length >= 2 && texts.length <= 4 && words(hs[0]) <= 5
    && words(el) >= 8 && words(el) <= 80 && isPainted(el);
}

function isPrincipleGrid(el) {
  const kids = contentChildren(el);
  return kids.length >= 2 && kids.length <= 8 && kids.every(isPrincipleCard);
}

/* columns-voice: examples of [short label | pair of painted [tile label | quote] tiles] */
function isVoicePair(el) {
  const kids = contentChildren(unwrap(el));
  return kids.length === 2 && kids.every((t) => textOnly(t) && headings(t).length === 1
    && textElements(t).length === 2 && words(t) <= 30 && isPainted(t));
}

function isVoiceExample(el) {
  if (!textOnly(el)) return false;
  if (isVoicePair(el)) return true;
  const kids = contentChildren(unwrap(el));
  if (kids.length !== 2) return false;
  const [label, pair] = kids;
  return !headings(label).length && textElements(label).length === 1 && words(label) <= 8 && isVoicePair(pair);
}

function isVoiceExamples(el) {
  const kids = contentChildren(el);
  const first = kids.findIndex(isVoiceExample);
  if (first === -1) return false;
  return kids.slice(first).every(isVoiceExample)
    && kids.slice(0, first).every((c) => textOnly(c) && textElements(c).length <= 2);
}

/* columns-terms: [term | tick / cross icon] grid, or 2-3 painted columns of short lines */
function isTermIconCell(el) {
  const imgs = contentImages(el);
  if (imgs.length !== 1 || !(imgs[0].getAttribute('src') || '').startsWith('data:image/svg+xml')) return false;
  const w = parseFloat(imgs[0].getAttribute('width')) || 0;
  return w > 0 && w <= 60 && textElements(el).length <= 1 && words(el) <= 6;
}

function isTermIconGrid(el) {
  const rows = contentChildren(el);
  if (rows.length < 3) return false;
  const cells = [];
  const ok = rows.every((r) => {
    const k = contentChildren(r);
    cells.push(...k);
    return k.length >= 2 && k.length <= 3 && k.every(isTermIconCell);
  });
  return ok && cells.filter((c) => textOf(c)).length >= cells.length / 2;
}

function isTermColumns(el) {
  const cols = contentChildren(el);
  if (cols.length < 2 || cols.length > 3 || !inPaintedPanel(el)) return false;
  return cols.every((c) => {
    const texts = textElements(c);
    return textOnly(c) && !headings(c).length && texts.length >= 4
      && texts.every((t) => t.tagName === 'P' && words(t) <= 12);
  });
}

/* cards-social: 3+ tiles of [platform icon | name + handles], mostly @handles / #hashtags */
function isSocialGrid(el) {
  const kids = contentChildren(el);
  if (kids.length < 3) return false;
  const ok = kids.every((t) => contentImages(t).length === 1 && !videos(t).length && !headings(t).length
    && textElements(t).length >= 1 && textElements(t).length <= 3 && words(t) <= 15);
  return ok && kids.filter((t) => /[@#]/.test(textOf(t))).length >= kids.length / 2;
}

export const detectors = [
  // a photo band with artwork laid over it (tested first: its images are not a photo row)
  { name: 'banner-overlay', test: (el) => isLayeredBand(el), validate: (el) => isLayeredBand(el) },
  { name: 'cards-swatch', test: (el) => isSwatchGrid(el) || isSwatchTile(el), // a lone tile: its container was rejected
    validate: (el) => /hex/i.test(textOf(el)) },
  { name: 'cards-contrast', test: (el, ctx) => isContrastGrid(el) || isLogoContrastGrid(el, ctx),
    validate: (el) => /background/i.test(textOf(el)) || contentImages(el).length >= 4 },
  { name: 'cards-gradient', test: (el) => isGradientGrid(el), validate: (el) => /gradient/i.test(textOf(el)) },
  { name: 'columns-voice', test: (el) => isVoiceExamples(el), validate: (el) => isVoiceExamples(el) },
  { name: 'cards-principle', test: (el) => isPrincipleGrid(el), validate: (el) => isPrincipleGrid(el) },
  { name: 'columns-terms', test: (el) => isTermIconGrid(el) || isTermColumns(el),
    validate: (el) => isTermIconGrid(el) || isTermColumns(el) },
  { name: 'cards-social', test: (el) => isSocialGrid(el), validate: (el) => isSocialGrid(el) },
  { name: 'cards-misuse', test: (el) => isMisuseGrid(el), validate: (el) => contentImages(el).length >= 2 && /don/i.test(textOf(el)) },
  { name: 'columns-typeface', test: (el) => isTypefaceRow(el), validate: (el) => /\d{4}/.test(textOf(el)) },
  { name: 'video-autoplay', test: (el) => isVideoContainer(el), validate: (el) => videos(el).length >= 1 },
  { name: 'cards-logo', test: (el, ctx) => isLogoVersionGrid(el, ctx), validate: (el) => contentImages(el).length >= 2 },
  { name: 'cards-framed', test: (el, ctx) => isFramedGrid(el, ctx, { lockups: true }), validate: (el) => contentImages(el).length >= 1 },
  { name: 'columns-panel', test: (el, ctx) => isBadgePanel(el, ctx), validate: (el) => contentImages(el).length >= 2 },
  { name: 'cards-shape', test: (el, ctx) => isShapeGrid(el) || isLoneGroupGraphic(el, ctx),
    validate: (el) => contentImages(el).length >= 1 },
  { name: 'columns-photos', test: (el, ctx) => isPhotoRow(el, ctx), validate: (el) => contentImages(el).length >= 2 },
  { name: 'columns-text-image', test: (el) => isTextImage(el), validate: (el) => contentImages(el).length >= 1 && !!textOf(el) },
];
