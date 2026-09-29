export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

/** Run fn once, the first time el scrolls into view. */
export function onEnter(els: Element[], fn: (el: Element) => void, threshold = 0.2, rootMargin = '0px 0px -6% 0px') {
  if (!els.length) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), { threshold, rootMargin });
  els.forEach((el) => io.observe(el));
}

/** rAF-throttled scroll listener. */
export function onScroll(fn: () => void) {
  let t = false;
  addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { fn(); t = false; }); } }, { passive: true });
  fn();
}

let toastTimer: number | undefined;
export function toast(msg: string) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = window.setTimeout(() => el.classList.remove('show'), 1800);
}

export async function copyText(text: string, msg = 'Copied') {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch { toast('Copy failed — select it manually'); }
}
