import { $ } from './util';

const menu = $('#menu'), btn = $('#menubtn'), x = $('#menux');
if (menu && btn) {
  const open = () => { menu.classList.add('show'); btn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; x?.focus(); };
  const close = () => { menu.classList.remove('show'); btn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  btn.addEventListener('click', open);
  x?.addEventListener('click', close);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  menu.querySelectorAll('[data-open-palette]').forEach((a) => a.addEventListener('click', close));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('show')) close(); });
  matchMedia('(min-width:1051px)').addEventListener('change', (e) => e.matches && close());
}
