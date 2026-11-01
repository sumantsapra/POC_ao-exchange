/* eslint-disable */
/* global WebImporter */

/**
 * Structure-based block detectors for the sub-brand-guide template
 * (/ao-live, /ao-ballpark, /ao-one-point-slam, /ao-reserve, /ao-shop,
 * /opening-week, /partner-guidelines). Used by import-sub-brand-guide.js when
 * the /ao-live (and /ao-reserve, /partner-guidelines) instance selectors from page-templates.json
 * do not match.
 * Order matters: the first detector that accepts an element wins and its
 * subtree is not tested again.
 *
 * Image-only tile grids look the same for logos, shapes, panels and photos, so
 * they are told apart by context: the nearest previous heading, the band
 * (outermost section) layer name, whether the band is a media-only full-bleed
 * band, and the intrinsic image facts (object-fit / size).
 */
import {
  textOf,
  textElements,
  contentChildren,
  contentImages,
  videos,
  isImageGrid,
  isLabelledImageTile,
  isPhoto,
  uniformBleed,
  isCropped,
  isGraphic,
  isMediaOnly,
  inMediaOnlyBand,
  bandOf,
  isSwatchGrid,
  isSwatchTile,
  isContrastGrid,
  isVideoContainer,
  isTypefaceRow,
  isMisuseGrid,
  isFramedGrid,
  isSideBySide,
  headings,
  mediaWrapper,
  contextOf,
  previousHeading,
} from './common.js';

const EXCLUSION_RE = /exclusion|minimum size|clear ?space|safe ?zone/i;
const LOGO_RE = /logo|designation|lock-?up|wordmark|marque/i;

/* hero-banner: the first media element of the page, before any heading */
function heroOf(ctx) {
  if (ctx.hero !== undefined) return ctx.hero;
  ctx.hero = null;
  const media = [...ctx.root.querySelectorAll('img, video')]
    .find((m) => m.tagName === 'VIDEO' || contentImages(m).length);
  if (media && !previousHeading(media, ctx)) ctx.hero = mediaWrapper(media, ctx.root);
  return ctx.hero;
}

/* cards-tone: short campaign lines in text-only tiles */
function isUpper(t) {
  const letters = t.replace(/[^A-Za-z]/g, '');
  return letters.length > 0 && letters.replace(/[^A-Z]/g, '').length / letters.length >= 0.8;
}

function isToneGrid(el) {
  const kids = contentChildren(el);
  if (kids.length < 2) return false;
  const tiles = kids.every((k) => {
    if (contentImages(k).length || videos(k).length) return false;
    const texts = textElements(k);
    return texts.length >= 1 && texts.length <= 3 && textOf(k).split(' ').length <= 14;
  });
  if (!tiles) return false;
  const named = /^voice$/i.test(el.getAttribute('data-framer-name') || ''); // shared Framer layer name
  const upper = kids.filter((k) => isUpper(textOf(k))).length / kids.length >= 0.6;
  return named || upper;
}

/* image grids: logos / shapes / panels / photos */
function isLabelledGrid(el) {
  const kids = contentChildren(el);
  return kids.length >= 2 && kids.every((k) => isLabelledImageTile(k));
}

function imageGridKind(el, ctx) {
  const plain = isImageGrid(el);
  if (!plain && !isLabelledGrid(el)) return null;
  const imgs = contentImages(el);
  const { heading } = contextOf(el, ctx);
  const band = bandOf(el);
  const bandName = (band && band.getAttribute('data-framer-name')) || '';
  if (EXCLUSION_RE.test(heading)) { // exclusion zone / minimum size artwork frames
    return plain && imgs.length >= 2 && imgs.length <= 3 ? 'cards-framed' : null;
  }
  // product logos are a graphic grid (analysis of /ao-reserve), not logo-version tiles
  if (/product logo/i.test(heading) && plain && imgs.length >= 4) return 'cards-shape';
  if (LOGO_RE.test(bandName)) return 'cards-logo';
  if (plain && inMediaOnlyBand(el) && imgs.every(isPhoto) && uniformBleed(imgs)) return 'columns-photos';
  if (/shape/i.test(heading) && imgs.every((i) => !isCropped(i))) return plain ? 'cards-shape' : null;
  if (LOGO_RE.test(heading)) return 'cards-logo';
  if (!plain) return null;
  if (/photo|imagery|application|example/i.test(`${heading} ${bandName}`) && imgs.length <= 8 && imgs.every(isPhoto) && uniformBleed(imgs)) return 'columns-photos';
  // icon / sticker grids: mostly small graphics (a few larger bitmaps are allowed)
  if (imgs.length >= 4 && imgs.filter((i) => isGraphic(i)).length >= imgs.length * 0.75) return 'cards-shape';
  if (imgs.length >= 2 && imgs.length <= 6 && imgs.every(isCropped)) return 'columns-panel';
  return null;
}

/*
 * columns-panel: a lone artwork image on a light or Hits Different Blue panel clearly
 * larger than it (/partner-guidelines "Official Partner Composite Logos" on #f8f8f8,
 * /ao-one-point-slam "Primary Logo" on #0078ff): the panel is the block.
 */
function isLonePanel(el) {
  if (el.tagName === 'SECTION' || textOf(el) || videos(el).length || contentImages(el).length !== 1) return false;
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function' || typeof el.getBoundingClientRect !== 'function') return false;
  let cs = null;
  try { cs = view.getComputedStyle(el); } catch (e) { return false; }
  const m = (cs.backgroundColor || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
  if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) return false;
  const [r, g, b] = [m[1], m[2], m[3]].map((c) => parseInt(c, 10));
  // panel colours columns-panel can show: light (white / #f8f8f8) or Hits Different Blue
  const light = [r, g, b].every((c) => c >= 240);
  const hdBlue = Math.hypot(r, g - 120, b - 255) < 30;
  if (!(light || hdBlue)) return false;
  const box = el.getBoundingClientRect();
  const img = contentImages(el)[0].getBoundingClientRect();
  return box.width > 0 && img.width > 0 && img.width * img.height < 0.6 * box.width * box.height;
}

/* columns-text-image: one logo per row, [logo tile | title + description] side by side */
function isLogoRow(el) {
  if (!isSideBySide(el)) return false;
  const text = contentChildren(el).find((k) => !contentImages(k).length);
  return headings(text).length >= 1 || textElements(text).length >= 2;
}

export const detectors = [
  { name: 'hero-banner', test: (el, ctx) => el === heroOf(ctx), validate: (el) => isMediaOnly(el) },
  { name: 'cards-swatch', test: (el) => isSwatchGrid(el) || isSwatchTile(el), // a lone tile: its container was rejected
    validate: (el) => /hex/i.test(textOf(el)) },
  { name: 'cards-contrast', test: (el) => isContrastGrid(el), validate: (el) => /background/i.test(textOf(el)) },
  { name: 'columns-typeface', test: (el) => isTypefaceRow(el), validate: (el) => /\d{4}/.test(textOf(el)) },
  { name: 'video-autoplay', test: (el) => isVideoContainer(el), validate: (el) => videos(el).length >= 1 },
  { name: 'cards-tone', test: (el) => isToneGrid(el), validate: (el) => !!textOf(el) },
  { name: 'cards-misuse', test: (el) => isMisuseGrid(el), validate: (el) => contentImages(el).length >= 2 && /don/i.test(textOf(el)) },
  { name: 'cards-framed', test: (el, ctx) => isFramedGrid(el, ctx) || imageGridKind(el, ctx) === 'cards-framed',
    validate: (el) => contentImages(el).length >= 1 },
  { name: 'columns-text-image', test: (el) => isLogoRow(el), validate: (el) => contentImages(el).length >= 1 && !!textOf(el) },
  { name: 'cards-logo', test: (el, ctx) => imageGridKind(el, ctx) === 'cards-logo', validate: (el) => contentImages(el).length >= 2 },
  { name: 'cards-shape', test: (el, ctx) => imageGridKind(el, ctx) === 'cards-shape', validate: (el) => contentImages(el).length >= 2 },
  { name: 'columns-photos', test: (el, ctx) => imageGridKind(el, ctx) === 'columns-photos', validate: (el) => contentImages(el).length >= 2 },
  // image sets on a panel; a lone artwork on a light panel (tested last, after every other block)
  { name: 'columns-panel', test: (el, ctx) => imageGridKind(el, ctx) === 'columns-panel' || isLonePanel(el),
    validate: (el) => contentImages(el).length >= 2 },
];
