/**
 * Fetches the footer fragment. Local preview serves it under /content, DA/EDS at the root.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  let path = '/content/footer.plain.html';
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    path = '/footer.plain.html';
    resp = await fetch('/footer.plain.html');
  }
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(path, window.location.href).href };
}

/**
 * Resolves fragment-relative image paths against the fragment URL.
 * @param {Element} root
 * @param {string} base
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
  });
}

/**
 * Decorates the footer: a brand column (the section holding an image) and a text column.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footer = await fetchFooter();
  if (!footer) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = footer.html;
  resolveImages(fragment, footer.base);

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  [...fragment.children].forEach((section) => {
    section.className = section.querySelector('img') ? 'footer-brand' : 'footer-text';
    section.querySelectorAll('img').forEach((img) => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });
    inner.append(section);
  });

  block.textContent = '';
  block.append(inner);
}
