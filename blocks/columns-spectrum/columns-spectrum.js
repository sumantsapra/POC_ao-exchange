const VIDEO_RE = /\.(mp4|webm|mov)(\?.*)?$/i;

function buildVideo(href) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  ['muted', 'loop', 'playsinline'].forEach((attr) => video.setAttribute(attr, ''));
  video.setAttribute('preload', 'metadata');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.setAttribute('controls', '');
  } else {
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('aria-hidden', 'true');
  }
  const source = document.createElement('source');
  source.src = href;
  source.type = 'video/mp4';
  video.append(source);
  return video;
}

/**
 * Columns spectrum: a scale between two ends (/partner-guidelines audience scale from
 * "Invitation to play" to "Reinforce prestige", then the Playful / Premium videos).
 * Three columns: [start | between | end].
 * - text rows: the start text sits at the start, the end text at the end; an image in the
 *   middle cell is the scale drawn as a line under the row;
 * - media row (a cell links to a video): the ends as videos, the middle image (arrow) between
 *   them; stacked on mobile.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const links = cells.map((cell) => [...cell.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href)));
    row.className = links.some(Boolean) ? 'columns-spectrum-media' : 'columns-spectrum-ends';
    cells.forEach((cell, i) => {
      let pos = 'between';
      if (i === 0) pos = 'start';
      else if (i === cells.length - 1) pos = 'end';
      cell.className = `columns-spectrum-${pos}`;
      if (links[i]) {
        cell.textContent = '';
        cell.append(buildVideo(links[i].href));
      } else if (!cell.textContent.trim() && !cell.querySelector('img, picture')) {
        cell.remove();
      }
    });
  });
}
