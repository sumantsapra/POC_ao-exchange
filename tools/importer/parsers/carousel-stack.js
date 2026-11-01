/* eslint-disable */
/* global WebImporter */

/**
 * carousel-stack (homepage #intro).
 * The mapped element is the first video card (#photo1); the block spans every following
 * sibling card that holds a video (#photo2, #photo3), skipping the empty spacer divs.
 * Each row: [video link (Supabase URL, no extension) | caption paragraph with <em> accent].
 *
 * On desktop only one caption element exists (#first-sentence, showing the last state),
 * so captions come from the DOM only when there is one per card; otherwise the captions
 * captured from the live page are used in order.
 */
const CAPTURED_CAPTIONS = [
  ['It’s the ', 'roar of the crowd.'],
  ['It’s the ', 'heat of the summer.'],
  ['It’s the ', 'pulse of the city.'],
];

function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function mediaSrc(card) {
  const video = card.querySelector('video[src], video source[src]');
  if (video) return { type: 'video', src: video.getAttribute('src') };
  const link = card.querySelector('a[href]');
  if (link) return { type: 'video', src: link.getAttribute('href') };
  const img = [...card.querySelectorAll('img')].find((i) => !(i.getAttribute('src') || '').startsWith('data:'));
  if (img) return { type: 'image', src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
  return null;
}

function hasMedia(el) {
  return !!el.querySelector('video, img:not([src^="data:"])') || (el.tagName === 'A' && /supabase|\.mp4/.test(el.href));
}

function captionFromParts(document, lead, accent) {
  const p = document.createElement('p');
  p.append(lead);
  const em = document.createElement('em');
  em.textContent = accent;
  p.append(em);
  return p;
}

function captionFromDom(document, el) {
  // "It's the <span>pulse of the city</span><span>.</span>" -> lead + accent
  const text = textOf(el);
  const m = text.match(/^(It[’']s the )(.+)$/i);
  if (!m) return null;
  return captionFromParts(document, m[1].replace("'", '’'), m[2].replace(/\s+\./, '.'));
}

export default function parse(element, { document }) {
  // collect the card and its following sibling cards
  const cards = [element];
  let next = element.nextElementSibling;
  const spacers = [];
  while (next) {
    if (hasMedia(next)) cards.push(next);
    else if (!textOf(next)) spacers.push(next);
    else break;
    next = next.nextElementSibling;
  }

  // DOM captions in this section ("It's the ...")
  const scope = element.parentElement || document;
  const domCaptionEls = [...scope.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
    .filter((h) => !cards.some((c) => c.contains(h)) && /^It[’']s the /i.test(textOf(h)));
  const useDom = domCaptionEls.length === cards.length;

  const cells = [];
  cards.forEach((card, i) => {
    const media = mediaSrc(card);
    let mediaCell = '';
    if (media && media.type === 'video') {
      const a = document.createElement('a');
      a.href = media.src;
      a.textContent = media.src;
      mediaCell = a;
    } else if (media) {
      const img = document.createElement('img');
      img.src = media.src;
      img.alt = media.alt;
      mediaCell = img;
    }
    let caption = useDom ? captionFromDom(document, domCaptionEls[i]) : null;
    if (!caption && CAPTURED_CAPTIONS[i]) caption = captionFromParts(document, ...CAPTURED_CAPTIONS[i]);
    cells.push([mediaCell, caption || '']);
  });

  // the caption slot is consumed by the block
  domCaptionEls.forEach((h) => {
    const wrapper = h.closest('[id="first-sentence"]') || h;
    wrapper.remove();
  });
  cards.slice(1).forEach((c) => c.remove());
  spacers.forEach((s) => s.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-stack', cells });
  element.replaceWith(block);
}
