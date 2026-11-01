/*
 * Cards: gradient
 * Each row is one gradient: a heading (name) followed by a list of colour-stop names.
 * Stop names map to brand colours (overridable with --color-<slug> custom properties);
 * a raw CSS colour (e.g. "#00e1ff") is also accepted as a stop.
 */

const BRAND_COLOURS = {
  'process blue': '#0091d2',
  'royal blue': '#1e2886',
  'hits different blue': '#0078ff',
  'navy blue': '#000c3c',
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

/**
 * Resolve an authored colour name to a CSS colour value, or null when unknown.
 * @param {string} name
 * @returns {string|null}
 */
function resolveColour(name) {
  const key = normalise(name);
  if (!key) return null;
  if (BRAND_COLOURS[key]) return `var(--color-${slug(key)}, ${BRAND_COLOURS[key]})`;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key) || CSS.supports('color', key)) return key;
  return null;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-gradient-tile';
    const body = document.createElement('div');
    body.className = 'cards-gradient-body';
    [...row.children].forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });
    li.append(body);

    const heading = body.querySelector('h1, h2, h3, h4, h5, h6, p');
    if (heading) heading.classList.add('cards-gradient-name');

    const list = body.querySelector('ul, ol');
    const names = list ? [...list.querySelectorAll(':scope > li')].map((item) => item.textContent.trim()) : [];
    if (list) list.classList.add('cards-gradient-stops');

    const colours = names.map(resolveColour).filter(Boolean);
    if (colours.length === 1) li.style.setProperty('--gradient', colours[0]);
    if (colours.length > 1) {
      const step = 100 / (colours.length - 1);
      const stops = colours.map((c, i) => `${c} ${Math.round(i * step * 100) / 100}%`).join(', ');
      li.style.setProperty('--gradient', `linear-gradient(90deg, ${stops})`);
    }
    if (list) {
      [...list.children].forEach((item, i) => {
        item.classList.add('cards-gradient-stop');
        const c = resolveColour(names[i] || '');
        if (c) item.style.setProperty('--stop-color', c);
      });
    }
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
