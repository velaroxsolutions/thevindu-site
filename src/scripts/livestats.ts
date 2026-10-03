// The page ships with numbers from build time; this swaps in fresh ones from
// /api/stats (a cached Vercel function) without making anyone wait for them.
import { $, $$ } from './util';

type Stats = {
  github: { calendar: { total: number; days: { d: string; c: number }[] } | null; activity: { repo: string; at: string; text: string }[]; profile: { repos: number } } | null;
  chess: { lichess: { rapid?: number; blitz?: number } | null; chesscom: { rapid?: number } | null } | null;
};

const targets = $$('[data-live]');
if (targets.length) {
  fetch('/api/stats', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((s: Stats | null) => s && apply(s))
    .catch(() => {});
}

function set(key: string, v: unknown) {
  if (v == null) return;
  $$(`[data-live="${key}"]`).forEach((el) => {
    if (el.textContent === String(v)) return;
    el.textContent = String(v);
    el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh');
  });
}

function apply(s: Stats) {
  set('chesscom-rapid', s.chess?.chesscom?.rapid);
  set('lichess-rapid', s.chess?.lichess?.rapid ?? s.chess?.lichess?.blitz);
  const gh = s.github;
  if (!gh) return;
  if (gh.calendar) set('gh-total', `${gh.calendar.total} contributions`);
  const heat = $('[data-live="heatmap"]');
  if (heat && gh.calendar?.days.length) {
    const weeks = +(heat.dataset.weeks || 26);
    const recent = gh.calendar.days.slice(-(weeks * 7));
    const pad = new Date(recent[0].d + 'T00:00:00Z').getUTCDay();
    const max = Math.max(1, ...recent.map((x) => x.c));
    const lvl = (c: number) => (c === 0 ? 0 : Math.min(4, Math.ceil((c / max) * 4)));
    heat.style.setProperty('--cols', String(Math.ceil((pad + recent.length) / 7)));
    heat.innerHTML = '<i class="pad"></i>'.repeat(pad) +
      recent.map((x, i) => `<i class="l${lvl(x.c)}" style="--k:${Math.floor((pad + i) / 7)}" title="${x.c} on ${x.d}"></i>`).join('');
  }
  const last = gh.activity?.[0], el = $('[data-live="gh-last"]');
  if (last && el) {
    const days = Math.round((Date.now() - +new Date(last.at)) / 864e5);
    const ago = days < 1 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
    el.innerHTML = '';
    const repo = document.createElement('span'); repo.className = 'gh-repo'; repo.textContent = last.repo.split('/').pop() || '';
    el.append(repo, ` ${last.text} · ${ago}`);
  }
}
