const HEADING = 'h1, h2, h3, h4, h5, h6';

/* a font name is a short label; anything longer is copy */
const MAX_NAME_LENGTH = 40;

function isEmpty(cell) {
  return !cell.textContent.trim() && !cell.querySelector('img, picture, video');
}

/**
 * A specimen cell has no heading and at least two paragraphs, the first (short) naming the font.
 */
function isSpecimen(cell) {
  if (cell.querySelector(HEADING)) return false;
  const paras = cell.querySelectorAll(':scope > p');
  return paras.length >= 2 && paras[0].textContent.trim().length <= MAX_NAME_LENGTH;
}

function slug(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function wrapStyleNames(p) {
  const words = [];
  [...p.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
        const span = document.createElement('span');
        span.textContent = word;
        words.push(span);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim()) {
      const span = document.createElement('span');
      span.append(...node.childNodes);
      if (node.tagName === 'STRONG' || node.tagName === 'B') span.classList.add('is-bold');
      if (node.tagName === 'EM' || node.tagName === 'I') span.classList.add('is-italic');
      words.push(span);
    }
  });
  words.forEach((span) => {
    span.classList.add('columns-typeface-style', `columns-typeface-style-${slug(span.textContent)}`);
  });
  p.replaceChildren(...words.flatMap((span, i) => (i ? [document.createTextNode(' '), span] : [span])));
}

/**
 * When the font name and glyph line were authored as one paragraph ("Arial1234&%#@"),
 * split them so the specimen keeps its name / glyphs / styles structure.
 */
function splitNameAndGlyphs(cell) {
  const paras = [...cell.querySelectorAll(':scope > p')];
  if (paras.length !== 2) return;
  const [first] = paras;
  const match = first.textContent.trim().match(/^(.*?[^\d\s])\s*(\d[\d\s]*[&%#@].*)$/);
  if (!match) return;
  const [, nameText, glyphText] = match;
  const glyphs = document.createElement('p');
  glyphs.textContent = glyphText;
  first.textContent = nameText;
  first.after(glyphs);
}

function decorateSpecimen(cell) {
  cell.classList.add('columns-typeface-specimen');
  splitNameAndGlyphs(cell);
  const paras = [...cell.querySelectorAll(':scope > p')];
  const [name, glyphs, ...rest] = paras;
  // a two-line name ("Sequel Sans<br>Wide 100") reads as one
  const nameCopy = name.cloneNode(true);
  nameCopy.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  const fontName = nameCopy.textContent.replace(/\s+/g, ' ').trim();
  cell.dataset.font = fontName;
  cell.classList.add(`columns-typeface-font-${slug(fontName)}`);
  cell.style.setProperty('--columns-typeface-font', `"${fontName}"`);
  name.classList.add('columns-typeface-name');
  glyphs.classList.add('columns-typeface-glyphs');
  const styles = rest.pop();
  if (styles) {
    styles.classList.add('columns-typeface-styles');
    wrapStyleNames(styles);
  }
}

/**
 * Columns typeface: font specimen panels with an optional copy column beside.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-typeface-row');
    let hasSpecimen = false;
    [...row.children].forEach((cell) => {
      if (isEmpty(cell)) {
        cell.remove();
        return;
      }
      if (!hasSpecimen && isSpecimen(cell)) {
        decorateSpecimen(cell);
        hasSpecimen = true;
      } else {
        cell.classList.add('columns-typeface-text');
      }
    });
    if (row.children.length === 1) {
      row.classList.add('columns-typeface-row-full');
    } else if (row.querySelector(`.columns-typeface-text :is(${HEADING})`)) {
      /* titled copy sits beside the specimen */
      row.classList.add('columns-typeface-row-side');
    } else {
      /* untitled copy runs below the specimen */
      row.classList.add('columns-typeface-row-stacked');
    }
  });
}
