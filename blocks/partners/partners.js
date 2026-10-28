/**
 * Sponsor rows. Each row is a label cell plus a cell of logos.
 * @param {Element} block Partners block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('partner-row');
    const cells = [...row.children];
    if (cells[0]) cells[0].classList.add('partner-label');
    if (cells[1]) cells[1].classList.add('partner-logos');
  });
}
