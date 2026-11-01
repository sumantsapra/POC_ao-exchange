/**
 * Cards tone: grid of text-only tone-of-voice tiles, text centred.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-tone-card';
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim()) return;
      cell.className = 'cards-tone-card-body';
      li.append(cell);
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
}
