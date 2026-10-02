import { $, $$ } from './util';

const scale = $('#railscale');
if (scale && matchMedia('(min-width:1100px)').matches) {
  const fill = $('#railfill')!, pctEl = $('#railpct')!;
  const secs = $$('[data-sec]');
  let marks: HTMLElement[] = [];
  // One marker that glides between sections, with a label that fades out and back in.
  const cur = document.createElement('span');
  cur.className = 'mk-cur'; cur.innerHTML = '<i></i><b></b>';
  const curLbl = cur.querySelector('b')!;
  let active = -1, swap = 0;

  const build = () => {
    scale.querySelectorAll('.tick,.mk').forEach((n) => n.remove());
    scale.appendChild(cur);
    const h = scale.clientHeight, n = Math.floor(h / 9);
    for (let i = 0; i <= n; i++) {
      const t = document.createElement('i');
      t.className = 'tick' + (i % 5 === 0 ? ' maj' : '');
      t.style.top = (i / n) * 100 + '%';
      scale.appendChild(t);
    }
    const doc = document.documentElement.scrollHeight - innerHeight;
    marks = secs.map((s) => {
      const top = s.getBoundingClientRect().top + scrollY;
      const p = doc > 0 ? Math.min(1, Math.max(0, (top - 80) / doc)) : 0;
      const a = document.createElement('a');
      a.className = 'mk'; a.href = '#' + (s.id || ''); a.style.top = p * 100 + '%';
      if (!s.id) a.addEventListener('click', (e) => { e.preventDefault(); s.scrollIntoView({ behavior: 'smooth' }); });
      a.innerHTML = '<i></i><b></b>'; a.querySelector('b')!.textContent = s.dataset.secname || '';
      scale.appendChild(a);
      return a;
    });
  };
  const update = () => {
    const doc = document.documentElement.scrollHeight - innerHeight;
    const p = doc > 0 ? Math.min(1, scrollY / doc) : 0;
    fill.style.height = p * 100 + '%';
    pctEl.textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';
    let next = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) next = i; });
    marks.forEach((m, i) => { m.classList.toggle('on', i === next); m.classList.toggle('past', i < next); });
    if (next !== active && marks[next]) {
      const first = active < 0;
      active = next;
      cur.style.top = marks[next].style.top;
      clearTimeout(swap);
      cur.classList.add('swap');
      const text = secs[next].dataset.secname || '';
      swap = window.setTimeout(() => { curLbl.textContent = text; cur.classList.remove('swap'); }, first ? 0 : 220);
    }
  };
  const clock = () => {
    const el = $('#railtime'); if (!el) return;
    el.textContent = new Date().toLocaleTimeString('en-CA', { timeZone: 'America/Edmonton', hour: '2-digit', minute: '2-digit', hour12: false });
  };
  build(); update(); clock(); setInterval(clock, 20000);
  requestAnimationFrame(() => cur.classList.add('ready'));
  addEventListener('scroll', update, { passive: true });
  const rebuild = () => { build(); active = -1; update(); };
  addEventListener('resize', rebuild);
  addEventListener('load', rebuild);
}
