/**
 * Columns terms: columns of short term lists inside one panel (/tone-of-voice
 * "Editorial style guide" and "Naming conventions"). One row, one cell per column, each cell
 * a list of terms. A cell may start with the line "Correct" or "Incorrect" ("Do" / "Don't"):
 * the line is hidden and every term of the column gets a tick or a cross. <em> inside a term
 * is a small usage note.
 * @param {Element} block
 */
const MARKERS = {
  correct: 'correct',
  do: 'correct',
  incorrect: 'incorrect',
  "don't": 'incorrect',
  'don’t': 'incorrect',
  dont: 'incorrect',
};

export default function decorate(block) {
  let checks = false;
  [...block.children].forEach((row) => {
    row.className = 'columns-terms-row';
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim()) {
        cell.remove();
        return;
      }
      cell.className = 'columns-terms-column';
      const first = cell.firstElementChild;
      const kind = first && first.tagName === 'P' && MARKERS[first.textContent.trim().toLowerCase()];
      if (kind) {
        first.remove();
        cell.classList.add(`columns-terms-${kind}`);
        checks = true;
      }
      // plain paragraphs (no list) are one term each
      if (!cell.querySelector('ul, ol')) {
        const ul = document.createElement('ul');
        [...cell.children].forEach((p) => {
          const li = document.createElement('li');
          li.append(...p.childNodes);
          ul.append(li);
        });
        cell.replaceChildren(ul);
      }
    });
  });
  if (checks) block.classList.add('columns-terms-checks');
}
