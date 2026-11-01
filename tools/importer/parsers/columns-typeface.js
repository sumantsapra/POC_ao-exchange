/* eslint-disable */
/* global WebImporter */

/**
 * columns-typeface (sub-brand-guide typography specimens, e.g. /ao-live).
 * The mapped element is row 1 (Aro specimen); following siblings that are also font
 * specimens (contain a glyph line: a digit run followed by symbols, e.g. "1234567890&%#@" on
 * /ao-live or "1234&%#@" on the other sub-brand pages) are further rows of the same block
 * (row 2: Neue Plak specimen + "Secondary font" copy).
 * The copy column may have no heading (then it is the non-specimen half of the row).
 * Each row: [specimen: <p>Font name</p><p>glyphs</p><p>width/weight names</p> | copy column or empty].
 * Specimen paragraphs split at <br> into separate paragraphs; weight names such as "Bold"
 * are wrapped in <strong> so the block renders them in that weight.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const WEIGHT_RE = /^(bold|black|heavy|semibold|semi-bold|extrabold|extra-bold)$/i;
// glyph line: 3+ digits followed (within a few characters) by symbols such as &%#@, or a run
// of 4+ CJK characters (/typography "Ping Fang SC 官 方 合 作 伙 伴")
const GLYPH_RE = /\d{3,}\s*[^\sA-Za-z\d]{0,3}\s*[&%#@$!?*]|(?:[\u3400-\u9fff]\s*){4,}/;
const GLYPH_RE_G = new RegExp(GLYPH_RE.source, 'g');
const isSpecimen = (el) => GLYPH_RE.test(el.textContent || '');
const glyphCount = (el) => ((el.textContent || '').match(GLYPH_RE_G) || []).length;

/**
 * A following sibling may hold several rows (/ao-shop "Lookup Content" = Sharp Sans row +
 * Poppins row): split it into its specimen-bearing children until each part holds one glyph line.
 */
function rowsOf(el) {
  if (glyphCount(el) <= 1) return [el];
  const parts = [...el.children].filter((c) => textOf(c) && isSpecimen(c));
  if (!parts.length) return [el];
  return parts.flatMap(rowsOf);
}

// split a paragraph's text at <br> into separate lines
function linesOf(p) {
  const clone = p.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  // the importer drops Framer's <strong><br></strong> line break: a bold font name run straight
  // into the glyph line ("<strong>Arial</strong>1234&%#@") is a line break on the source
  clone.querySelectorAll('strong, b').forEach((s) => {
    const next = s.nextSibling;
    if (next && next.nodeType === 3 && /^[^\s,.;:!?]/.test(next.textContent)) s.after('\n');
  });
  return clone.textContent.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function specimenParagraph(document, line) {
  const p = document.createElement('p');
  const words = line.split(' ');
  if (words.length > 1 && words.some((w) => WEIGHT_RE.test(w))) {
    words.forEach((w, i) => {
      if (i) p.append(' ');
      if (WEIGHT_RE.test(w)) {
        const strong = document.createElement('strong');
        strong.textContent = w;
        p.append(strong);
      } else p.append(w);
    });
  } else p.textContent = line;
  return p;
}

function textGroupOf(heading, root) {
  let node = heading;
  // climb from the heading until the next wrapper would also take in the specimen glyph line
  while (node.parentElement && node.parentElement !== root && !isSpecimen(node.parentElement)) {
    node = node.parentElement;
  }
  return node;
}

function buildRow(document, source) {
  const heading = [...source.querySelectorAll(HEADINGS)].find((h) => textOf(h));
  let textGroup = heading ? textGroupOf(heading, source) : null;
  if (!textGroup) {
    // copy column without a heading (e.g. /typography "Sharp Sans is a clean..."): the
    // non-specimen half of a [specimen | copy] row
    // a short non-specimen half (e.g. weight numbers "86 85 46 45") is part of the specimen box
    const halves = [...source.children].filter((c) => textOf(c));
    const other = halves.length === 2 ? halves.find((c) => !isSpecimen(c)) : null;
    if (other && /[a-z]{3,}/i.test(textOf(other)) && textOf(other).split(' ').length >= 6) textGroup = other;
  }

  const specimen = [];
  source.querySelectorAll('p').forEach((p) => {
    if (textGroup && textGroup.contains(p)) return;
    if (p.parentElement.closest('p')) return;
    linesOf(p).forEach((line) => specimen.push(specimenParagraph(document, line)));
  });

  const copy = [];
  if (textGroup) {
    textGroup.querySelectorAll(`${HEADINGS}, p`).forEach((node) => {
      if (node.parentElement.closest(`${HEADINGS}, p`)) return;
      const t = textOf(node);
      if (!t) return;
      const el = document.createElement(node.tagName.toLowerCase());
      el.textContent = t;
      copy.push(el);
    });
  }
  // a font name set on two lines before the glyph line ("Sequel Sans" / "Wide 100" on /ao-shop,
  // /ao-ballpark) is one name paragraph with a line break
  const glyphAt = specimen.findIndex((p) => GLYPH_RE.test(p.textContent));
  if (glyphAt >= 2) {
    const name = specimen[0];
    specimen.slice(1, glyphAt).forEach((p) => { name.append(document.createElement('br'), ...p.childNodes); });
    specimen.splice(1, glyphAt - 1);
  }
  return [specimen.length ? specimen : '', copy.length ? copy : ''];
}

export default function parse(element, { document }) {
  const sources = [element];
  // the next row may be the sibling of a single-child wrapper around this row
  let anchor = element;
  while (!(anchor.nextElementSibling && isSpecimen(anchor.nextElementSibling)) && anchor.parentElement
    && [...anchor.parentElement.children].filter((c) => textOf(c)).length === 1) {
    anchor = anchor.parentElement;
  }
  let next = anchor.nextElementSibling;
  const siblings = [];
  while (next && isSpecimen(next)) {
    siblings.push(next);
    sources.push(...rowsOf(next));
    next = next.nextElementSibling;
  }

  const cells = sources.map((s) => buildRow(document, s));
  siblings.forEach((s) => s.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-typeface', cells });
  element.replaceWith(block);
}
