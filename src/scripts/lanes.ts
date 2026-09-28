import { $$ } from './util';

export function setLane(lane: string) {
  document.body.dataset.filter = lane;
  $$('.lanes button').forEach((o) => o.setAttribute('aria-pressed', String(o.dataset.lane === lane)));
  try { sessionStorage.setItem('lane', lane); } catch {}
  dispatchEvent(new CustomEvent('lanechange', { detail: lane }));
}
$$('.lanes button').forEach((b) => b.addEventListener('click', () => setLane(b.dataset.lane!)));
try { const l = sessionStorage.getItem('lane'); if (l && l !== 'all' && $$('.lanes').length) setLane(l); } catch {}
