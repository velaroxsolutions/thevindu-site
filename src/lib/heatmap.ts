// Draws the contribution graph the way GitHub lays it out: one column per week
// (Sunday at the top), month labels above, Mon/Wed/Fri down the side, GitHub's
// own five shading levels. Pure string output so the server render and the live
// refresh in the browser produce exactly the same markup.
export type Cell = { d: string; c: number | null; l: number };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};
const tip = (x: Cell) =>
  x.c == null ? `${['No', 'Some', 'Some', 'Lots of', 'Lots of'][x.l]} contributions on ${fmt(x.d)}`
  : `${x.c === 0 ? 'No' : x.c} contribution${x.c === 1 ? '' : 's'} on ${fmt(x.d)}`;

export function heatmapHTML(days: Cell[], total: number, label = 'contributions in the last year') {
  if (!days.length) return '';
  const dow0 = new Date(days[0].d + 'T00:00:00Z').getUTCDay();
  const weeks = Math.ceil((dow0 + days.length) / 7);
  let cells = '', months = '';
  let lastMonthCol = -9, prevMonth = -1;
  days.forEach((x, i) => {
    const col = Math.floor((dow0 + i) / 7) + 2; // grid col 1 = weekday labels
    const row = ((dow0 + i) % 7) + 2; // grid row 1 = month labels
    const month = Number(x.d.slice(5, 7)) - 1;
    if (month !== prevMonth) {
      // Same rule GitHub uses visually: skip a label that would collide with the previous one.
      const at = row === 2 ? col : col + 1;
      if (at - lastMonthCol >= 3) { months += `<span class="ghcal-m" style="grid-column:${at}/span 3">${MONTHS[month]}</span>`; lastMonthCol = at; }
      prevMonth = month;
    }
    cells += `<i class="l${x.l}" style="grid-area:${row}/${col}" data-tip="${tip(x)}"></i>`;
  });
  const wd = ['Mon', 'Wed', 'Fri'].map((d, k) => `<span class="ghcal-wd" style="grid-row:${k * 2 + 3}">${d}</span>`).join('');
  const legend = [0, 1, 2, 3, 4].map((l) => `<i class="l${l}"></i>`).join('');
  return `<div class="ghcal-scroll"><div class="ghcal-grid" style="--weeks:${weeks}" role="img" aria-label="${total} ${label}">${months}${wd}${cells}</div></div>` +
    `<div class="ghcal-foot"><span>${total.toLocaleString('en-CA')} ${label}</span><span class="ghcal-legend">Less ${legend} More</span></div>`;
}
