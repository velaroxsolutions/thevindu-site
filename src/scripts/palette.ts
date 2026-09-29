import { $, copyText } from './util';
import { toggleTheme } from './theme';
import { setLane } from './lanes';
import { SITE_EMAIL } from './site-config';

type Cmd = { t: string; k: string; g: string; url?: string; ext?: string; act?: string; lane?: string };

const pal = $('#pal'), pi = $<HTMLInputElement>('#palinput'), pl = $('#pallist');
const data = $('#pal-data');
if (pal && pi && pl && data) {
  const CMDS: Cmd[] = JSON.parse(data.textContent || '[]');
  let sel = 0, res: Cmd[] = CMDS, lastFocus: Element | null = null;

  // Fuzzy-ish scoring: exact prefix > word prefix > substring > in-order letters.
  const score = (c: Cmd, q: string) => {
    const t = c.t.toLowerCase();
    if (!q) return 1;
    if (t.startsWith(q)) return 100;
    if (t.split(/[\s—-]+/).some((w) => w.startsWith(q))) return 60;
    if (t.includes(q)) return 40;
    if ((c.k + ' ' + c.g).toLowerCase().includes(q)) return 15;
    let i = 0; for (const ch of t) if (ch === q[i]) i++;
    return i === q.length ? 5 : 0;
  };
  const esc = (s: string) => s.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]!);
  const hi = (t: string, q: string) => {
    const i = q ? t.toLowerCase().indexOf(q) : -1;
    return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length));
  };

  const draw = (q = '') => {
    if (!res.length) { pl.innerHTML = '<div class="empty">Nothing found. Try “aperis”, “books”, or “dark”.</div>'; return; }
    let g = '', html = '';
    res.forEach((c, i) => {
      if (c.g !== g && !q) { g = c.g; html += `<div class="pal-group">${esc(g)}</div>`; }
      html += `<button role="option" data-i="${i}" class="${i === sel ? 'sel' : ''}" aria-selected="${i === sel}"><i class="${c.lane || ''}"></i><span>${hi(c.t, q)}</span><span class="k">${esc(c.k)}</span></button>`;
    });
    pl.innerHTML = html;
    pl.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
  };
  const filter = () => {
    const q = pi.value.trim().toLowerCase();
    res = q ? CMDS.map((c) => [c, score(c, q)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([c]) => c) : CMDS;
    sel = 0; draw(q);
  };
  const run = (c?: Cmd) => {
    if (!c) return; close();
    if (c.act === 'theme') toggleTheme();
    else if (c.act === 'copy-email') copyText(SITE_EMAIL, 'Email copied');
    else if (c.act?.startsWith('lane:')) setLane(c.act.slice(5));
    else if (c.ext) window.open(c.ext, '_blank', 'noopener');
    else if (c.url) location.href = c.url;
  };
  const open = () => { lastFocus = document.activeElement; pal.classList.add('show'); pi.value = ''; filter(); pi.focus(); };
  const close = () => { pal.classList.remove('show'); (lastFocus as HTMLElement | null)?.focus?.(); };

  document.querySelectorAll('#palbtn,[data-open-palette]').forEach((b) => b.addEventListener('click', open));
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) document.querySelectorAll('.kmod').forEach((k) => (k.textContent = 'Ctrl '));
  pal.addEventListener('click', (e) => { if (e.target === pal) close(); });
  pl.addEventListener('click', (e) => { const b = (e.target as Element).closest<HTMLElement>('button[data-i]'); if (b) run(res[+b.dataset.i!]); });
  pl.addEventListener('mousemove', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('button[data-i]'); if (!b || +b.dataset.i! === sel) return;
    pl.querySelector('.sel')?.classList.remove('sel'); b.classList.add('sel'); sel = +b.dataset.i!;
  });
  pi.addEventListener('input', filter);
  addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as Element).tagName) && e.target !== pi;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('show') ? close() : open(); return; }
    if (e.key === '/' && !typing && !pal.classList.contains('show')) { e.preventDefault(); open(); return; }
    if (!pal.classList.contains('show')) return;
    const q = pi.value.trim().toLowerCase();
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, res.length - 1); draw(q); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); draw(q); }
    else if (e.key === 'Enter') { e.preventDefault(); run(res[sel]); }
  });
}
