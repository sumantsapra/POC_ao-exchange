/**
 * Columns voice: tone scale usage examples (/tone-of-voice "Usage examples").
 * Each row: [label | first tile | second tile]. A tile cell holds a tile label (heading)
 * and a quote. The first tile of a row is the playful end of the scale (process blue),
 * the second the premium end (navy). A row with two cells has no label.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    row.className = 'columns-voice-example';
    const tiles = cells.length >= 3 ? cells.slice(1) : cells;
    const label = cells.length >= 3 ? cells[0] : null;

    const out = [];
    if (label && label.textContent.trim()) {
      const p = document.createElement('p');
      p.className = 'columns-voice-label';
      p.textContent = label.textContent.trim();
      out.push(p);
    }
    const pair = document.createElement('div');
    pair.className = 'columns-voice-tiles';
    tiles.forEach((cell, i) => {
      if (!cell.textContent.trim()) return;
      cell.className = `columns-voice-tile columns-voice-tile-${i === 0 ? 'playful' : 'premium'}`;
      pair.append(cell);
    });
    out.push(pair);
    row.replaceChildren(...out);
  });
}
