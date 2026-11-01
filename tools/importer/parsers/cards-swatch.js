/* eslint-disable */
/* global WebImporter */

/**
 * cards-swatch (colour palettes on guideline-chapter and sub-brand-guide pages).
 * Each row: [optional texture image | h3 colour name + one "Label: value" paragraph per value].
 * Tiles are found by structure, not Framer hashes: every wrapper holding exactly one heading
 * (the colour name). Values are label/value text pairs (Hex / RGB / CMYK / PMS); the Framer
 * "Copy to Clipboard" button and "Copy HEX" label are dropped (the block adds its own control).
 * Tiles repeated by Framer breakpoint copies are deduped by name + values.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const isLabel = (t) => /^(hex|rgb|cmyk|pms|pantone|ral)\s*:?$/i.test(t);
const isNoise = (t) => /^copy( hex| to clipboard)?$/i.test(t);

function tileOf(heading, root) {
  let node = heading;
  while (node.parentElement && node.parentElement !== root
    && node.parentElement.querySelectorAll(HEADINGS).length === 1) {
    node = node.parentElement;
  }
  return node;
}

export default function parse(element, { document }) {
  const headings = [...element.querySelectorAll(HEADINGS)].filter((h) => textOf(h) && !isNoise(textOf(h)));
  const cells = [];
  const seen = new Set();
  const tiles = [];
  const notes = [];
  const addNote = (t) => { if (!notes.includes(t)) notes.push(t); };

  headings.forEach((heading) => {
    const tile = tileOf(heading, element);
    tiles.push(tile);
    const name = textOf(heading);

    // label/value pairs in document order
    const texts = [...tile.querySelectorAll('p')]
      .filter((p) => !p.closest('button'))
      .map((p) => textOf(p))
      .filter((t) => t && !isNoise(t) && t !== name);
    const values = [];
    for (let i = 0; i < texts.length; i += 1) {
      const t = texts[i];
      const inline = t.match(/^(hex|rgb|cmyk|pms|pantone|ral)\s*:\s*(.+)$/i);
      if (inline) {
        values.push(`${inline[1]}: ${inline[2]}`);
      } else if (isLabel(t) && texts[i + 1] && !isLabel(texts[i + 1])) {
        values.push(`${t.replace(/\s*:?$/, '')}: ${texts[i + 1]}`);
        i += 1;
      } else if (t.split(' ').length > 3) {
        addNote(t); // prose that sits next to a tile (e.g. a usage note)
      }
    }

    const key = `${name}|${values.join('|')}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const imageCell = [];
    const img = [...tile.querySelectorAll('img')].find((i) => !(i.getAttribute('src') || '').startsWith('data:'));
    if (img) {
      const pic = document.createElement('img');
      pic.src = imgSrc(img);
      pic.alt = img.getAttribute('alt') || name;
      imageCell.push(pic);
    }

    const textCell = [];
    const h3 = document.createElement('h3');
    h3.textContent = name;
    textCell.push(h3);
    values.forEach((v) => {
      const p = document.createElement('p');
      p.textContent = v;
      textCell.push(p);
    });
    cells.push([imageCell.length ? imageCell : '', textCell]);
  });

  // notes inside the palette wrapper but outside every tile (e.g. "Colour can have cultural
  // significance...") stay as default content after the block
  [...element.querySelectorAll('p')]
    .filter((p) => textOf(p) && !isNoise(textOf(p)) && !p.closest('button'))
    .filter((p) => !tiles.some((t) => t.contains(p)))
    .forEach((p) => addNote(textOf(p)));

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-swatch', cells });
  element.replaceWith(block);
  let anchor = block;
  notes.forEach((note) => {
    const p = document.createElement('p');
    p.textContent = note;
    anchor.after(p);
    anchor = p;
  });
}
