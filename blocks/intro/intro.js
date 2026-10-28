/**
 * Copy column plus a looping photo ticker.
 * @param {Element} block Intro block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.className = 'intro-row';
  const [copy, media] = [...row.children];
  if (copy) copy.classList.add('intro-copy');
  if (!media) return;
  media.classList.add('intro-ticker');
  const images = [...media.querySelectorAll('img')];
  const columns = [document.createElement('div'), document.createElement('div')];
  columns.forEach((column) => {
    column.className = 'ticker-col';
  });
  images.forEach((img, index) => {
    img.alt = img.alt || '';
    const frame = document.createElement('div');
    frame.className = 'ticker-frame';
    frame.append(img);
    columns[index % 2].append(frame);
  });
  columns.forEach((column) => {
    [...column.children].forEach((frame) => column.append(frame.cloneNode(true)));
  });
  media.replaceChildren(...columns);
}
