import { $$, reduce, fine } from './util';

if (fine && !reduce) {
  /* ---- cursor preview card on [data-peek] ---- */
  const peekables = $$('[data-peek]');
  if (peekables.length) {
    const p = document.createElement('div');
    p.id = 'peek'; p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<div class="pk"><b></b><small></small></div>';
    document.body.appendChild(p);
    const lbl = p.querySelector('b')!, sub = p.querySelector('small')!, pk = p.querySelector<HTMLElement>('.pk')!;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => { cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14; p.style.transform = `translate3d(${cx}px,${cy}px,0)`; raf = requestAnimationFrame(loop); };
    peekables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        lbl.textContent = el.dataset.peek || ''; sub.textContent = el.dataset.peekSub || '';
        pk.style.setProperty('--pk-rgb', el.dataset.peekRgb || 'var(--build-rgb)');
        cx = tx; cy = ty; p.classList.add('on'); if (!raf) loop();
      });
      el.addEventListener('mouseleave', () => {
        p.classList.remove('on');
        setTimeout(() => { if (!p.classList.contains('on')) { cancelAnimationFrame(raf); raf = 0; } }, 360);
      });
    });
    addEventListener('mousemove', (e) => { tx = e.clientX + 150; ty = e.clientY; }, { passive: true });
  }

  /* ---- ambient glow ---- */
  const g = document.createElement('div'); g.id = 'glow'; document.body.prepend(g);
  let t = false, x = 0, y = 0;
  addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    document.body.classList.add('glowon');
    if (!t) { t = true; requestAnimationFrame(() => { g.style.setProperty('--mx', x + 'px'); g.style.setProperty('--my', y + 'px'); t = false; }); }
  }, { passive: true });

  /* ---- magnetic links ---- */
  $$('.mag').forEach((el) => {
    el.style.transition = 'transform .35s var(--ease)';
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.22}px,${(e.clientY - (r.top + r.height / 2)) * 0.32}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}
