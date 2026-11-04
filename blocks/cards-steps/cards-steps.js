/**
 * Cards steps: a numbered process shown as centred steps (/partner-guidelines
 * "Approval process": Submit / Review / Iterate).
 * Each row: [step icon (numbered circle) | step title (heading) + description].
 * @param {Element} block
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-steps-step';
    [...row.children].forEach((cell) => {
      const onlyImage = cell.querySelector('picture, img') && !cell.textContent.trim();
      if (onlyImage) {
        cell.className = 'cards-steps-icon';
        // the number is in the artwork: decorative for assistive tech, the list carries the order
        cell.querySelectorAll('img').forEach((img) => { if (!img.alt) img.setAttribute('alt', ''); });
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-steps-body';
      } else {
        cell.remove();
        return;
      }
      li.append(cell);
    });
    if (li.children.length) ol.append(li);
  });
  block.replaceChildren(ol);
}
