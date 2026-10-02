import { $$ } from './util';

// Filter by lane. Deliberately NOT remembered between pages: a filter you forgot
// you'd set made half the next page look broken.
let pill: HTMLElement | null = null;
export function setLane(lane: string) {
  document.body.dataset.filter = lane;
  $$('.lanes button').forEach((o) => o.setAttribute('aria-pressed', String(o.dataset.lane === lane)));
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'lanepill'; pill.setAttribute('role', 'status');
    pill.innerHTML = '<span>Showing <b></b> first</span><button type="button">Show all</button>';
    pill.querySelector('button')!.addEventListener('click', () => setLane('all'));
    document.body.appendChild(pill);
  }
  const b = pill.querySelector('b')!;
  b.textContent = lane === 'build' ? 'Build' : 'Study'; b.className = lane;
  pill.classList.toggle('show', lane !== 'all');
  dispatchEvent(new CustomEvent('lanechange', { detail: lane }));
}
$$('.lanes button').forEach((b) => b.addEventListener('click', () => setLane(b.dataset.lane!)));
try { sessionStorage.removeItem('lane'); } catch {}
