/* AO brand colours an author can name in a "Background: <name>" line */
const CARD_COLOURS = {
  white: 'var(--ao-white, #fff)',
  black: '#000',
  'process blue': 'var(--ao-process-blue, #0091d2)',
  'royal blue': 'var(--ao-royal-blue, #1e2886)',
  'hits different blue': 'var(--ao-hits-different-blue, #0078ff)',
  navy: 'var(--ao-navy, #000c3c)',
  'dark navy': '#0f1242',
  'bright blue': 'var(--ao-bright-blue, #00e1ff)',
  lime: 'var(--ao-lime, #e1ff00)',
  'sky blue': '#80d9ff',
  stone: '#ebe8e5',
};

const BACKGROUND_LINE = /^\s*background\s*:\s*(.+?)\s*$/i;

/**
 * Reads and removes the "Background: <AO colour name | #hex>" line of a text column.
 * @param {Element} col
 * @returns {string|null} CSS colour
 */
function takeCardColour(col) {
  let colour = null;
  [...col.querySelectorAll('p')].forEach((p) => {
    const m = p.textContent.match(BACKGROUND_LINE);
    if (!m) return;
    const key = m[1].toLowerCase().replace(/\s+/g, ' ');
    const value = CARD_COLOURS[key] || (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key) ? key : null);
    if (!value) return;
    colour = value;
    p.remove();
  });
  return colour;
}

/**
 * Columns: text + image.
 * Each row is a set of columns; a cell that holds only a picture becomes the image column,
 * everything else is a text column. Columns stack on mobile and sit side by side,
 * vertically centred, from tablet up.
 * Image-first rows show the logo on a white card; a "Background: <colour>" line in the
 * text column paints that card (e.g. a reverse logo on Royal Blue).
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-text-image-${cols}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-text-image-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const onlyPicture = pic && !col.textContent.trim();
      if (onlyPicture) {
        col.classList.add('columns-text-image-img-col');
        // unwrap a picture wrapped in a lone paragraph
        const parent = pic.parentElement;
        if (parent !== col && parent.tagName === 'P' && parent.children.length === 1) {
          parent.replaceWith(pic);
        }
      } else {
        col.classList.add('columns-text-image-text-col');
        const colour = takeCardColour(col);
        if (colour) {
          row.style.setProperty('--cti-card-bg', colour);
          row.style.setProperty('--cti-card-border', '0');
        }
      }
    });
  });
}
