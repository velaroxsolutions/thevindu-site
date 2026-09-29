import { $$, reduce, onEnter, onScroll } from './util';

/* ---- fade/rise on entry ---- */
onEnter($$('[data-anim]'), (el) => el.classList.add('in'), 0.15);
/* ---- clip-mask line reveals ---- */
onEnter($$('.rv'), (el) => el.classList.add('in'), 0.2);
/* ---- progress bars ---- */
onEnter($$('.bar'), (el) => el.classList.add('lit'), 0.5);
/* ---- timeline spine + architecture diagram ---- */
onEnter($$('.tl'), (el) => el.classList.add('drawn'), 0.1);
$$<SVGPathElement>('.arch svg .ln').forEach((p) => { try { p.style.setProperty('--len', String(Math.ceil(p.getTotalLength()))); } catch {} });
onEnter($$('.arch'), (el) => el.classList.add('drawn'), 0.3);

/* ---- counters ---- */
onEnter($$('.count'), (el) => {
  const to = Number((el as HTMLElement).dataset.to);
  if (reduce || !to) { el.textContent = String(to); return; }
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / 900);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}, 0.6);

/* ---- drift: light parallax ---- */
const drifts = $$('[data-drift]');
if (drifts.length && !reduce) onScroll(() => {
  const vh = innerHeight;
  drifts.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const k = (r.top + r.height / 2 - vh / 2) / vh;
    el.style.transform = `translate3d(0,${(-k * (parseFloat(el.dataset.drift!) || 14)).toFixed(2)}px,0)`;
  });
});

/* ---- sticky side nav (case studies, notes) ---- */
const side = document.querySelector('.sidenav');
if (side) {
  const links = [...side.querySelectorAll('a')];
  const targets = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean) as HTMLElement[];
  onScroll(() => {
    let act = 0;
    targets.forEach((t, i) => { if (t.getBoundingClientRect().top < innerHeight * 0.35) act = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === act));
  });
}

/* ---- hover scramble on mono labels ---- */
if (!reduce) {
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  $$('.scr').forEach((el) => {
    const orig = el.textContent || ''; let raf = 0, f = 0;
    el.addEventListener('mouseenter', () => {
      cancelAnimationFrame(raf); f = 0;
      const step = () => {
        f++;
        el.textContent = orig.split('').map((c, i) => (c === ' ' ? ' ' : i < f / 1.6 ? orig[i] : CH[(Math.random() * CH.length) | 0])).join('');
        if (f / 1.6 < orig.length) raf = requestAnimationFrame(step); else el.textContent = orig;
      };
      raf = requestAnimationFrame(step);
    });
    el.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); el.textContent = orig; });
  });
}

/* ---- marquee: duplicate so the loop is seamless ---- */
$$('.marq-in').forEach((m) => {
  const clone = m.innerHTML; m.insertAdjacentHTML('beforeend', clone);
  [...m.children].slice(m.children.length / 2).forEach((c) => { c.setAttribute('aria-hidden', 'true'); c.setAttribute('tabindex', '-1'); });
});

/* ---- word-by-word scroll reveal ---- */
const wordEls = $$('.words');
wordEls.forEach((el) => {
  const out: Node[] = [];
  const push = (text: string, acc: boolean) => text.split(/(\s+)/).forEach((t) => {
    if (!t.trim()) { out.push(document.createTextNode(t)); return; }
    const w = document.createElement('w'); w.textContent = t; if (acc) w.className = 'acc'; out.push(w);
  });
  el.childNodes.forEach((n) => push(n.textContent || '', n.nodeType === 1 && (n as Element).tagName === 'EM'));
  el.replaceChildren(...out);
  if (reduce) el.querySelectorAll('w').forEach((w) => w.classList.add('lit'));
});
if (wordEls.length && !reduce) {
  const run = () => {
    const vh = innerHeight;
    wordEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (vh * 0.85 - r.top) / (vh * 0.45);
      const ws = el.querySelectorAll('w');
      const n = Math.round(Math.max(0, Math.min(1, p)) * ws.length * 1.12);
      ws.forEach((w, i) => w.classList.toggle('lit', i < n));
    });
  };
  onScroll(run); addEventListener('resize', run);
}
