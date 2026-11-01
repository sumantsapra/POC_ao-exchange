/*
 * Cards: contrast
 * Each row is one accessible colour pairing: a sample paragraph ("Aa"), then
 * "Background: <strong>Navy Blue</strong>" and "Text: <strong>Process Blue</strong>".
 * Colour names map to brand colours (overridable with --color-<slug> custom properties);
 * a raw CSS colour (e.g. "#00e1ff") is also accepted.
 * Image mode: when a row holds an image (e.g. a logo-on-colour tile on /logos), the image is
 * the sample instead of "Aa"; captions are optional.
 */

const BRAND_COLOURS = {
  'process blue': '#0091d2',
  'royal blue': '#1e2886',
  'hits different blue': '#0078ff',
  'navy blue': '#000c3c',
  navy: '#000c3c',
  // AO Reserve palette (measured on /ao-reserve contrast tiles)
  'dark navy': '#0f1242',
  'sky blue': '#80d9ff',
  stone: '#ebe8e5',
  'bright blue': '#00e1ff',
  'lime green': '#e1ff00',
  lime: '#e1ff00',
  'ruby red': '#df164c',
  white: '#ffffff',
  black: '#000000',
  'golden hour': '#ffbe0c',
  mint: '#32ffcc',
  'pink lemonade': '#ff96f8',
  watermelon: '#ff1d58',
};

const normalise = (name) => name.toLowerCase().replace(/\s+/g, ' ').trim();
const slug = (name) => normalise(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function resolveColour(name) {
  const key = normalise(name || '');
  if (!key) return null;
  if (BRAND_COLOURS[key]) return `var(--color-${slug(key)}, ${BRAND_COLOURS[key]})`;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key) || CSS.supports('color', key)) return key;
  return null;
}

/** Value of a "Label: value" paragraph — the <strong> text if present, else the text after ':'. */
function captionValue(p) {
  const strong = p.querySelector('strong, b');
  if (strong) return strong.textContent.trim();
  const idx = p.textContent.indexOf(':');
  return idx >= 0 ? p.textContent.slice(idx + 1).trim() : '';
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-contrast-item';

    const paragraphs = [];
    [...row.children].forEach((cell) => {
      paragraphs.push(...cell.querySelectorAll(':scope > p, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6'));
      if (!cell.children.length && cell.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = cell.textContent.trim();
        paragraphs.push(p);
      }
    });

    const sample = document.createElement('div');
    sample.className = 'cards-contrast-sample';
    const media = row.querySelector('picture') || row.querySelector('img');
    if (media) {
      sample.classList.add('cards-contrast-sample-image');
      sample.append(media);
    }
    const captions = document.createElement('div');
    captions.className = 'cards-contrast-captions';

    let background = null;
    let text = null;
    paragraphs.filter((p) => p.textContent.trim()).forEach((p) => {
      const label = p.textContent.trim().split(':')[0].trim().toLowerCase();
      if (p.textContent.includes(':') && /^(background|bg)$/.test(label)) {
        background = captionValue(p);
        p.classList.add('cards-contrast-caption', 'cards-contrast-background');
        captions.append(p);
      } else if (p.textContent.includes(':') && /^(text|foreground|fg)$/.test(label)) {
        text = captionValue(p);
        p.classList.add('cards-contrast-caption', 'cards-contrast-text');
        captions.append(p);
      } else if (!sample.children.length && p.textContent.trim()) {
        sample.append(p);
      } else {
        captions.append(p);
      }
    });
    if (!sample.children.length) {
      const p = document.createElement('p');
      p.textContent = 'Aa';
      sample.append(p);
    }

    const bg = resolveColour(background);
    const fg = resolveColour(text);
    if (bg) li.style.setProperty('--contrast-background', bg);
    if (fg) li.style.setProperty('--contrast-text', fg);
    sample.setAttribute('aria-hidden', 'true');

    li.append(sample, captions);
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
