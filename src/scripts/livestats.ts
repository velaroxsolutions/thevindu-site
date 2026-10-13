// The page ships with numbers from build time; this swaps in fresh ones from
// /api/stats (a cached Vercel function) without making anyone wait for them.
import { $, $$ } from './util';
import { heatmapHTML, type Cell } from '../lib/heatmap';
import { initCalendars } from './ghcal';

type Stats = {
  github: { contrib: { total: number; days: Cell[] } | null; activity: { repo: string; at: string; text: string }[] } | null;
  chess: Record<'lichess' | 'chesscom', Record<string, unknown> | null> | null;
  duolingo: { streak: number; xp: number } | null;
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
    if (el.dataset.to != null) el.dataset.to = String(v);
    if (el.textContent === String(v)) return;
    el.textContent = String(v);
    el.classList.remove('fresh'); void el.offsetWidth; el.classList.add('fresh');
  });
}

function apply(s: Stats) {
  // Each rating is keyed by site and time control, so a number only ever replaces the same number.
  for (const site of ['chesscom', 'lichess'] as const)
    for (const [k, v] of Object.entries(s.chess?.[site] ?? {})) if (typeof v === 'number') set(`chess-${site}-${k}`, v);
  if (s.duolingo) { set('duo-streak', s.duolingo.streak); set('duo-xp', s.duolingo.xp.toLocaleString('en-CA')); }
  const gh = s.github;
  if (!gh) return;
  const c = gh.contrib;
  if (c?.days.length) {
    set('gh-total', `${c.total.toLocaleString('en-CA')} this year`);
    const heat = $('[data-live="heatmap"]');
    const html = heatmapHTML(c.days, c.total);
    if (heat && heat.innerHTML !== html) { heat.innerHTML = html; initCalendars(heat); }
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
