/**
 * Agenda timeline. A row with only a heading is the page title.
 * Each session cell is: time paragraph, title, optional notes, optional logo.
 * @param {Element} block Agenda block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const titleOnly = row.children.length === 1
      && cell.querySelector('h1, h2')
      && !cell.querySelector('h3, img');
    if (titleOnly) {
      row.className = 'agenda-heading';
      return;
    }
    row.className = 'agenda-item';
    const time = cell.querySelector('p');
    if (time) time.classList.add('agenda-time');
    const heading = cell.querySelector('h3');
    if (heading) heading.classList.add('agenda-title');
    [...cell.querySelectorAll('p')].slice(1).forEach((note) => {
      if (!note.querySelector('img')) note.classList.add('agenda-note');
    });
    const logo = cell.querySelector('img');
    if (logo) {
      const presented = [...cell.querySelectorAll('p')]
        .find((p) => /presented by/i.test(p.textContent));
      if (presented) {
        presented.classList.add('agenda-by');
      } else {
        const by = document.createElement('p');
        by.className = 'agenda-by';
        by.textContent = 'Presented by';
        const host = logo.parentElement && logo.parentElement.tagName === 'P'
          ? logo.parentElement
          : logo;
        host.before(by);
      }
      logo.classList.add('agenda-logo');
    }
  });
}
