/**
 * Columns messaging: partner copy guidance on a light panel (/partner-guidelines
 * "Partner copy and messaging").
 * Row 1: role statements, one cell each ("Your brand's role:" / line break / role), centred.
 * Row 2: sample lines, one cell each: a tick or cross icon, then the line.
 * Any further row is laid out like row 2.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    row.className = i === 0 ? 'columns-messaging-roles' : 'columns-messaging-examples';
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('img, picture')) {
        cell.remove();
        return;
      }
      if (i === 0) {
        cell.className = 'columns-messaging-role';
        return;
      }
      cell.className = 'columns-messaging-example';
      // icon first (unwrap a picture authored in its own paragraph), then the line
      const pic = cell.querySelector('picture');
      if (pic) {
        const icon = document.createElement('div');
        icon.className = 'columns-messaging-icon';
        const holder = pic.parentElement;
        icon.append(pic);
        const emptyHolder = !holder.textContent.trim() && !holder.children.length;
        if (holder !== cell && emptyHolder) holder.remove();
        const text = document.createElement('div');
        text.className = 'columns-messaging-text';
        text.append(...cell.childNodes);
        cell.append(icon, text);
      }
    });
  });
}
