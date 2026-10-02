import { $, $$, reduce } from './util';

type Skill = { name: string; group: string; level: number; years: string; where: string; note: string };
const well = $('#skwell'), data = $('#sk-data');
if (well && data) {
  const SKILLS: Skill[] = JSON.parse(data.textContent || '[]');
  const count = $('#skcount')!, search = $<HTMLInputElement>('#sksearch')!, status = $('#skstatus');
  let group = 'all', query = '', charging = 0;
  const word = (l: number) => (l >= 9 ? 'strong' : l >= 6 ? 'working' : 'learning');
  const pct = (l: number) => Math.round((l / 12) * 100);
  const esc = (s: string) => s.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]!);
  const matches = (s: Skill, q: string) => !q || s.name.toLowerCase().includes(q) || s.where.toLowerCase().includes(q);
  const BOLT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>';

  /* ---- the charge: fill animates in CSS, the % readout counts up here ---- */
  const charge = (rows: HTMLElement[]) => {
    charging++;
    status?.classList.add('on'); status && (status.querySelector('span')!.textContent = 'Charging');
    let done = 0;
    rows.forEach((r, i) => {
      const bat = r.querySelector<HTMLElement>('.bat')!, out = r.querySelector<HTMLElement>('.spct')!;
      const to = +bat.dataset.p!, delay = i * 70, dur = 500 + to * 9;
      bat.classList.remove('full', 'go'); void bat.offsetWidth;
      bat.style.setProperty('--d', `${delay}ms`); bat.style.setProperty('--t', `${dur}ms`);
      bat.classList.add('go');
      if (reduce) { out.textContent = `${to}%`; bat.classList.add('full'); return; }
      const t0 = performance.now() + delay;
      const tick = (t: number) => {
        const k = Math.max(0, Math.min(1, (t - t0) / dur));
        out.textContent = `${Math.round(to * (1 - Math.pow(1 - k, 3)))}%`;
        if (k < 1) requestAnimationFrame(tick);
        else { bat.classList.add('full'); if (++done === rows.length && --charging === 0) settle(); }
      };
      requestAnimationFrame(tick);
    });
    if (reduce || !rows.length) { charging = 0; settle(); }
  };
  const settle = () => { status?.classList.remove('on'); status && (status.querySelector('span')!.textContent = 'Charged'); };

  const render = (go = true) => {
    const q = query.trim().toLowerCase();
    const list = SKILLS.filter((s) => group === 'all' || s.group === group).filter((s) => matches(s, q));
    if (!list.length) {
      well.innerHTML = `<div class="empty">No skill matches <b>${esc(query || 'that')}</b>.<br>Try: python, react, figma</div>`;
      count.textContent = '0 skills'; return;
    }
    well.innerHTML = list.map((s) => {
      const p = pct(s.level);
      return `<div class="srow" data-g="${s.group}" tabindex="0" role="button" aria-expanded="false">
        <div class="srow-h"><span class="sname">${esc(s.name)}</span>
          <span class="bat ${p < 40 ? 'low' : ''}" data-p="${p}" style="--p:${p}%" role="img" aria-label="${esc(s.name)}: ${word(s.level)}, ${p}%">
            <span class="bat-fill"></span><span class="bat-bolt">${BOLT}</span></span>
          <span class="spct">0%</span><span class="syrs">${esc(s.years)}</span></div>
        <div class="swhere">${esc(s.where)}</div>
        <div class="sdetail"><div><div class="sdetail-in">${esc(s.note)} <em class="sword">— ${word(s.level)}</em></div></div></div></div>`;
    }).join('');
    count.textContent = `${list.length} ${list.length === 1 ? 'skill' : 'skills'} · sorted by charge`;
    if (go && well.classList.contains('lit')) charge($$('.srow', well));
  };
  // Hovering a row tops that one battery up again.
  well.addEventListener('mouseover', (e) => {
    const r = (e.target as Element).closest<HTMLElement>('.srow');
    if (!r || r.dataset.hov === '1' || charging) return;
    r.dataset.hov = '1'; charge([r]);
    r.addEventListener('mouseleave', () => (r.dataset.hov = ''), { once: true });
  });
  well.addEventListener('click', (e) => toggle((e.target as Element).closest('.srow')));
  well.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle((e.target as Element).closest('.srow')); } });
  function toggle(r: Element | null) {
    if (!r) return;
    const o = r.classList.contains('open');
    well!.querySelectorAll('.srow.open').forEach((x) => { x.classList.remove('open'); x.setAttribute('aria-expanded', 'false'); });
    if (!o) { r.classList.add('open'); r.setAttribute('aria-expanded', 'true'); }
  }
  const syncPills = () => {
    const q = query.trim().toLowerCase();
    $$<HTMLButtonElement>('#skpills button').forEach((b) => { b.disabled = !(b.dataset.g === 'all' || SKILLS.some((s) => s.group === b.dataset.g && matches(s, q))); });
  };
  $$('#skpills button').forEach((b) => b.addEventListener('click', () => {
    $$('#skpills button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    group = b.dataset.g!; render();
  }));
  search.addEventListener('input', () => { query = search.value; syncPills(); render(); });
  syncPills(); render(false);
  const lite = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { well.classList.add('lit'); charge($$('.srow', well)); lite.disconnect(); }
  }), { threshold: 0.25 });
  lite.observe(well);
}
