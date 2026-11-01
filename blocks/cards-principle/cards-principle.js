/**
 * Cards principle: painted text-only cards (title + description), e.g. the
 * /tone-of-voice writing principles. One row per card, one cell.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-principle-card';
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim()) return;
      cell.className = 'cards-principle-card-body';
      li.append(cell);
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
}
