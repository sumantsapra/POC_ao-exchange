function decorateCard(cell) {
  cell.classList.add('speaker-card');
  const photo = cell.querySelector('img');
  if (photo) photo.classList.add('speaker-photo');
  const name = cell.querySelector('h3');
  if (name) name.classList.add('speaker-name');

  const paragraphs = [...cell.querySelectorAll('p')].filter((p) => !p.querySelector('img'));
  let roleSet = false;
  paragraphs.forEach((paragraph) => {
    const text = paragraph.textContent.trim();
    const isMeta = text.length < 90 && !/[.]\s*$/.test(text);
    if (!isMeta) {
      paragraph.classList.add('speaker-bio');
      return;
    }
    if (/virtual/i.test(text)) {
      paragraph.classList.add('speaker-virtual');
    } else if (!roleSet) {
      paragraph.classList.add('speaker-role');
      roleSet = true;
    } else {
      paragraph.classList.add('speaker-org');
    }
  });
}

/**
 * Speaker groups. A heading row introduces a group.
 * A row of cards is one group. A heading containing "more speakers" is the closer.
 * @param {Element} block Speakers block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const text = row.textContent.trim();
    const headingOnly = cells.length === 1 && cells[0].querySelector('h2') && !cells[0].querySelector('img');
    if (headingOnly && /more speakers/i.test(text)) {
      row.className = 'speakers-note';
      return;
    }
    if (headingOnly) {
      row.className = 'speakers-heading';
      return;
    }
    row.className = 'speakers-grid';
    cells.forEach(decorateCard);
  });
}
