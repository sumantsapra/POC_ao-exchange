/* eslint-disable */
/* global WebImporter */

/**
 * cards-social (guideline-chapter social media channels, /tone-of-voice "Social media").
 * Cards convention (2 columns): each row = one channel: [platform icon image | text].
 * Text cell: the source paragraphs with their inline structure kept: the platform name in
 * <strong>, handles and hashtags as <br>-separated lines
 * (e.g. <p><strong>Facebook</strong><br>@AustralianOpen</p><p>#AusOpen<br>#AO2027</p>).
 * Tiles are the content children of the grid, deduped by icon URL (Framer breakpoint copies).
 */
function textOf(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

const TEXT = 'p, h1, h2, h3, h4, h5, h6';

function imgSrc(img) {
  const src = img.getAttribute('src') || '';
  return /framerusercontent\.com\/images\//.test(src) ? src.split('?')[0] : src;
}

/** Copy of an inline run: text, <br>, <strong>/<b> (as strong), <em>/<i> (as em). */
function inline(document, node, out) {
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) { out.append(n.textContent.replace(/\s+/g, ' ')); return; }
    if (n.nodeType !== 1) return;
    if (n.tagName === 'BR') { out.append(document.createElement('br')); return; }
    if (/^(STRONG|B)$/.test(n.tagName)) {
      const s = document.createElement('strong');
      inline(document, n, s);
      // a trailing <br> inside <strong> belongs after it
      const tail = s.lastChild && s.lastChild.nodeName === 'BR' ? s.lastChild : null;
      if (tail) tail.remove();
      if (s.textContent.trim()) out.append(s);
      if (tail) out.append(tail);
      return;
    }
    if (/^(EM|I)$/.test(n.tagName)) {
      const e = document.createElement('em');
      inline(document, n, e);
      out.append(e);
      return;
    }
    inline(document, n, out);
  });
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();
  [...element.children].filter((c) => c.querySelector('img')).forEach((tile) => {
    const source = tile.querySelector('img');
    const src = imgSrc(source);
    if (!src || seen.has(src)) return;
    seen.add(src);
    const img = document.createElement('img');
    img.src = src;
    img.alt = source.getAttribute('alt') || tile.getAttribute('data-framer-name') || '';
    const texts = [...tile.querySelectorAll(TEXT)].filter((n) => !n.parentElement.closest(TEXT) && textOf(n));
    const textCell = texts.map((n) => {
      const p = document.createElement('p');
      inline(document, n, p);
      // the importer drops Framer's <strong><br></strong> line break: a name run straight into
      // its handle ("<strong>X</strong>@AustralianOpen") is a line break on the source
      p.querySelectorAll('strong').forEach((s) => {
        const next = s.nextSibling;
        if (next && next.nodeType === 3 && /^\S/.test(next.textContent)) s.after(document.createElement('br'));
      });
      return p;
    });
    cells.push([img, textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-social', cells });
  element.replaceWith(block);
}
