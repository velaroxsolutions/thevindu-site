import { $, $$ } from './util';

const scale = $('#railscale');
if (scale && matchMedia('(min-width:1100px)').matches) {
  const fill = $('#railfill')!, pctEl = $('#railpct')!;
  const secs = $$('[data-sec]');
  let marks: HTMLElement[] = [];

  const build = () => {
    scale.querySelectorAll('.tick,.mk').forEach((n) => n.remove());
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
    let active = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) active = i; });
    marks.forEach((m, i) => { m.classList.toggle('on', i === active); m.classList.toggle('past', i < active); });
  };
  const clock = () => {
    const el = $('#railtime'); if (!el) return;
    el.textContent = new Date().toLocaleTimeString('en-CA', { timeZone: 'America/Edmonton', hour: '2-digit', minute: '2-digit', hour12: false });
  };
  build(); update(); clock(); setInterval(clock, 20000);
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { build(); update(); });
  addEventListener('load', () => { build(); update(); });
}
