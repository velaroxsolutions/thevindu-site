// One shared tooltip for the contribution graph, and start scrolled to "now"
// on narrow screens (the newest weeks are on the right, like GitHub).
const tipEl = document.createElement('div');
tipEl.className = 'ghcal-tip'; tipEl.setAttribute('role', 'tooltip');
document.body.appendChild(tipEl);

export function initCalendars(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.ghcal-scroll').forEach((s) => { s.scrollLeft = s.scrollWidth; });
}
document.addEventListener('pointerover', (e) => {
  const cell = (e.target as Element).closest?.('.ghcal-grid i[data-tip]') as HTMLElement | null;
  if (!cell) { tipEl.classList.remove('on'); return; }
  const r = cell.getBoundingClientRect();
  tipEl.textContent = cell.dataset.tip || '';
  tipEl.style.left = `${r.left + r.width / 2}px`;
  tipEl.style.top = `${r.top}px`;
  tipEl.classList.add('on');
});
addEventListener('scroll', () => tipEl.classList.remove('on'), { passive: true });
initCalendars();
