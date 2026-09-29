import { $$ } from './util';

export function setTheme(t: 'light' | 'dark', x = innerWidth - 60, y = 28) {
  const d = document.documentElement;
  const apply = () => { d.dataset.theme = t; try { localStorage.setItem('theme', t); } catch {} };
  const vt = (document as any).startViewTransition;
  if (vt && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Circular wipe outward from wherever the toggle was clicked.
    d.style.setProperty('--tx', x + 'px'); d.style.setProperty('--ty', y + 'px');
    d.classList.add('theming');
    vt.call(document, apply).finished.finally(() => d.classList.remove('theming'));
  } else apply();
  dispatchEvent(new CustomEvent('themechange', { detail: t }));
}
export const toggleTheme = (e?: MouseEvent) =>
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', e?.clientX || undefined, e?.clientY || undefined);

$$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', (e) => toggleTheme(e as MouseEvent)));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  let saved: string | null = null; try { saved = localStorage.getItem('theme'); } catch {}
  if (!saved) setTheme(e.matches ? 'dark' : 'light');
});
