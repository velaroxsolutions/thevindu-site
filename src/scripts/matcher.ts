import { $, $$, reduce } from './util';

type Prof = { handle: string; note: string; v: number[] };
const root = $('#matcher'), data = $('#mt-data');
if (root && data) {
  const { DIMS, PROFILES, YOU } = JSON.parse(data.textContent!) as { DIMS: { name: string; w: number }[]; PROFILES: Prof[]; YOU: number[] };
  const list = $('#mtlist')!, radar = $('#mtradar')!, selName = $('#mtsel')!;
  const inputs = $$<HTMLInputElement>('input[type=range]', root);
  let you = [...YOU], selected = 0;

  const weights = () => inputs.map((i) => +i.value);
  // Weighted Euclidean distance → similarity in [0,1].
  const score = (v: number[], w: number[]) => {
    const sw = w.reduce((a, b) => a + b, 0) || 1;
    const d = Math.sqrt(v.reduce((a, x, i) => a + w[i] * (x - you[i]) ** 2, 0) / sw);
    return Math.max(0, 1 - d * 1.6);
  };

  // FLIP: remember positions, re-render, animate from old → new.
  const render = () => {
    const w = weights();
    const first = new Map($$('li', list).map((li) => [li.dataset.h, li.getBoundingClientRect().top]));
    const ranked = PROFILES.map((p, idx) => ({ p, idx, s: score(p.v, w) })).sort((a, b) => b.s - a.s);
    list.innerHTML = ranked.map(({ p, idx, s }, r) => `
      <li data-h="${p.handle}" data-idx="${idx}" class="${r < 3 ? 'intro' : ''} ${idx === selected ? 'sel' : ''}" tabindex="0">
        <span class="mt-rank">${String(r + 1).padStart(2, '0')}</span>
        <span class="mt-lock" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>
        <span class="mt-who"><b>${p.handle}</b><small>${p.note}</small></span>
        <span class="mt-score"><i style="--s:${s.toFixed(3)}"></i><em>${Math.round(s * 100)}</em></span>
      </li>`).join('');
    if (!reduce) $$('li', list).forEach((li) => {
      const f = first.get(li.dataset.h); if (f == null) return;
      const dy = f - li.getBoundingClientRect().top; if (!dy) return;
      li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.19,.9,.26,1)' });
    });
    drawRadar();
  };

  const poly = (v: number[], r = 90) => v.map((x, i) => {
    const a = -Math.PI / 2 + (i / v.length) * Math.PI * 2;
    return `${(Math.cos(a) * x * r).toFixed(1)},${(Math.sin(a) * x * r).toFixed(1)}`;
  }).join(' ');
  const drawRadar = () => {
    const w = weights(), n = DIMS.length, p = PROFILES[selected];
    let s = '';
    [0.25, 0.5, 0.75, 1].forEach((k) => (s += `<polygon class="rg" points="${poly(Array(n).fill(k))}"/>`));
    DIMS.forEach((d, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      s += `<line class="rg" x1="0" y1="0" x2="${Math.cos(a) * 90}" y2="${Math.sin(a) * 90}" style="stroke-width:${0.6 + w[i] * 0.4}"/>`;
      s += `<text x="${Math.cos(a) * 102}" y="${Math.sin(a) * 102 + 3}">${d.name.split(' ')[0]}</text>`;
    });
    s += `<polygon class="rthem" points="${poly(p.v)}"/><polygon class="ryou" points="${poly(you)}"/>`;
    radar.innerHTML = s; selName.textContent = p.handle;
  };

  inputs.forEach((i) => i.addEventListener('input', () => { (i.nextElementSibling as HTMLOutputElement).value = i.value; render(); }));
  list.addEventListener('click', (e) => { const li = (e.target as Element).closest<HTMLElement>('li'); if (li) { selected = +li.dataset.idx!; render(); } });
  list.addEventListener('keydown', (e) => { if (e.key === 'Enter') (e.target as HTMLElement).click(); });
  $('#mtshuffle')?.addEventListener('click', () => { you = you.map(() => Math.round((0.15 + Math.random() * 0.8) * 100) / 100); render(); });
  render();
}
