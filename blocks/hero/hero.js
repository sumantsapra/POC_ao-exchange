/**
 * Hero: wordmark plus the five event facts.
 * @param {Element} block Hero block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const wordmark = rows.shift();
  if (wordmark) wordmark.className = 'hero-wordmark';
  const facts = rows[0];
  if (facts) {
    facts.className = 'hero-facts';
    [...facts.children].forEach((cell) => cell.classList.add('hero-fact'));
  }
}
