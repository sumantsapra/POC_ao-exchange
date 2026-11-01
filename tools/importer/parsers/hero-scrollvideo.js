/* eslint-disable */
/* global WebImporter */

/**
 * hero-scrollvideo (homepage #hitsdifferentsection).
 * Row 1: link to the MP4 behind the title.
 * Row 2: eyebrow (<strong>) + caption pairs and the H2 title, in reading order:
 *   pair 1, H2 "Hits Different", pair 2, pair 3.
 * The Framer source repeats the title and the first pair in a later scroll phase and splits
 * the title into one heading per word; both are deduped / joined here.
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function videoSrc(el) {
  const video = el.querySelector('video[src], video source[src]');
  if (video) return video.getAttribute('src');
  const link = [...el.querySelectorAll('a[href]')].find((a) => /\.mp4(\?|$)/i.test(a.getAttribute('href')));
  return link ? link.getAttribute('href') : '';
}

export default function parse(element, { document }) {
  const cells = [];

  const mp4 = videoSrc(element);
  const mediaCell = [];
  if (mp4) {
    const a = document.createElement('a');
    a.href = mp4;
    a.textContent = mp4;
    mediaCell.push(a);
  }
  cells.push([mediaCell]);

  // title: unique words of the H2 headings, in order
  const titleWords = [];
  element.querySelectorAll('h1, h2').forEach((h) => {
    const t = textOf(h);
    if (t && !titleWords.includes(t)) titleWords.push(t);
  });

  const nodes = [...element.querySelectorAll('h1, h2, h3, h4, h5, h6, p')];
  const content = [];
  const seenEyebrows = new Set();
  let titleDone = false;
  nodes.forEach((node, i) => {
    const t = textOf(node);
    if (!t) return;
    if (/^H[12]$/.test(node.tagName)) {
      if (titleDone || !titleWords.length) return;
      const h2 = document.createElement('h2');
      h2.textContent = titleWords.join(' ');
      content.push(h2);
      titleDone = true;
      return;
    }
    if (node.tagName === 'P') return; // captions are emitted with their eyebrow
    const key = t.toLowerCase();
    if (seenEyebrows.has(key)) return;
    seenEyebrows.add(key);
    const eyebrow = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = t;
    eyebrow.append(strong);
    content.push(eyebrow);
    // caption: the next paragraph before any other heading
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (nodes[j].tagName !== 'P') break;
      const ct = textOf(nodes[j]);
      if (ct) {
        const p = document.createElement('p');
        p.textContent = ct;
        content.push(p);
        break;
      }
    }
  });
  if (!titleDone && titleWords.length) {
    const h2 = document.createElement('h2');
    h2.textContent = titleWords.join(' ');
    content.unshift(h2);
  }
  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-scrollvideo', cells });
  element.replaceWith(block);
}
