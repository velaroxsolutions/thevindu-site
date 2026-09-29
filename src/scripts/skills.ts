import { $, $$ } from './util';

type Skill = { name: string; group: string; level: number; years: string; where: string; note: string };
const well = $('#skwell'), data = $('#sk-data');
if (well && data) {
  const SKILLS: Skill[] = JSON.parse(data.textContent || '[]');
  const count = $('#skcount')!, search = $<HTMLInputElement>('#sksearch')!;
  let group = 'all', query = '';
  const word = (l: number) => (l >= 9 ? 'strong' : l >= 6 ? 'working' : 'learning');
  const esc = (s: string) => s.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]!);
  const matches = (s: Skill, q: string) => !q || s.name.toLowerCase().includes(q) || s.where.toLowerCase().includes(q);

  const render = (relight = true) => {
    const q = query.trim().toLowerCase();
    const list = SKILLS.filter((s) => group === 'all' || s.group === group).filter((s) => matches(s, q));
    if (!list.length) {
      well.innerHTML = `<div class="empty">No skill matches <b>${esc(query || 'that')}</b>.<br>Try: python, react, figma</div>`;
      count.textContent = '0 skills'; return;
    }
    well.innerHTML = list.map((s, ri) => {
      const segs = Array.from({ length: 12 }, (_, i) => `<i class="seg${i < s.level ? ' on' : ''}" style="--s:${ri * 1.4 + i}"></i>`).join('');
      return `<div class="srow" data-g="${s.group}" tabindex="0" role="button" aria-expanded="false">
        <div class="srow-h"><span class="sname">${esc(s.name)}</span><span class="meter" aria-label="${word(s.level)}">${segs}</span>
        <span class="slevel">${word(s.level)}</span><span class="syrs">${esc(s.years)}</span></div>
        <div class="swhere">${esc(s.where)}</div>
        <div class="sdetail"><div><div class="sdetail-in">${esc(s.note)}</div></div></div></div>`;
    }).join('');
    count.textContent = `${list.length} ${list.length === 1 ? 'skill' : 'skills'} · sorted by depth`;
    if (relight && well.classList.contains('lit')) {
      well.classList.remove('lit');
      requestAnimationFrame(() => requestAnimationFrame(() => well.classList.add('lit')));
    }
  };
  well.addEventListener('click', (e) => toggle((e.target as Element).closest('.srow')));
  well.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle((e.target as Element).closest('.srow')); }
  });
  function toggle(r: Element | null) {
    if (!r) return;
    const o = r.classList.contains('open');
    well!.querySelectorAll('.srow.open').forEach((x) => { x.classList.remove('open'); x.setAttribute('aria-expanded', 'false'); });
    if (!o) { r.classList.add('open'); r.setAttribute('aria-expanded', 'true'); }
  }
  const syncPills = () => {
    const q = query.trim().toLowerCase();
    $$<HTMLButtonElement>('#skpills button').forEach((b) => {
      b.disabled = !(b.dataset.g === 'all' || SKILLS.some((s) => s.group === b.dataset.g && matches(s, q)));
    });
  };
  $$('#skpills button').forEach((b) => b.addEventListener('click', () => {
    $$('#skpills button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    group = b.dataset.g!; render();
  }));
  search.addEventListener('input', () => { query = search.value; syncPills(); render(); });
  render(false);
  const lite = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { well.classList.add('lit'); lite.disconnect(); } }), { threshold: 0.25 });
  lite.observe(well);
}
