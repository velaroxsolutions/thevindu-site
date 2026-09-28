import { $, reduce } from './util';

type P = { l: string; k: string; lane: 'build' | 'study'; h: string; w: number };
type Pt = P & { x: number; y: number; hx: number; hy: number; vx: number; vy: number; r: number; ambient?: boolean };

const cv = $<HTMLCanvasElement>('#field'), data = $('#field-data');
if (cv && data) {
  const ctx = cv.getContext('2d')!;
  const tip = $<HTMLAnchorElement>('#fieldtip')!, read = $('#fieldread')!, nnEl = $('#fieldnn')!;
  const items: P[] = JSON.parse(data.textContent || '[]');

  // Seeded RNG so the map is the same on every visit.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const C = { build: { x: 0.3, y: 0.66 }, study: { x: 0.7, y: 0.34 } };
  const spread = 0.12;

  const pts: Pt[] = [];
  const add = (p: P, ambient = false) => {
    const c = C[p.lane];
    const hx = Math.min(0.94, Math.max(0.06, c.x + gauss() * spread * (ambient ? 1.25 : 1)));
    const hy = Math.min(0.92, Math.max(0.08, c.y + gauss() * spread * (ambient ? 1.25 : 1)));
    pts.push({ ...p, x: hx, y: hy, hx, hy, vx: 0, vy: 0, r: ambient ? 1.1 : 1.8 + p.w * 0.9, ambient });
  };
  items.forEach((p) => add(p));
  for (let i = 0; i < 150; i++) add({ l: '', k: '', lane: i % 2 ? 'build' : 'study', h: '', w: 0 }, true);

  let W = 0, H = 0, dpr = 1;
  let col = { build: '', study: '', ink: '', muted: '', rule: '', faint: '', label: '' };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    const g = (v: string) => cs.getPropertyValue(v).trim();
    col = { build: g('--build'), study: g('--study'), ink: g('--ink'), muted: g('--muted'), rule: g('--rule'), faint: g('--faint'), label: g('--card') };
  };
  const size = () => {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let mx = -1, my = -1, userActive = false, lastMove = 0, hover: Pt | null = null, t0 = performance.now();
  let lane = document.body.dataset.filter || 'all';

  const nearest = (qx: number, qy: number, k = 5) =>
    pts.filter((p) => !p.ambient && (lane === 'all' || p.lane === lane))
      .map((p) => ({ p, d: Math.hypot(p.x - qx, (p.y - qy) * (H / W)) }))
      .sort((a, b) => a.d - b.d).slice(0, k);

  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // idle: the query orbits on its own
    let qx: number, qy: number;
    if (userActive && now - lastMove < 4000) { qx = mx / W; qy = my / H; }
    else { userActive = false; qx = 0.5 + Math.cos(t * 0.35) * 0.26; qy = 0.5 + Math.sin(t * 0.5) * 0.2; }

    // grid ticks
    ctx.strokeStyle = col.rule; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
    for (let i = 1; i < 10; i++) {
      const x = Math.round((W * i) / 10) + 0.5, y = Math.round((H * i) / 10) + 0.5;
      ctx.beginPath(); ctx.moveTo(x, H - 5); ctx.lineTo(x, H); ctx.moveTo(0, y); ctx.lineTo(5, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // the gap between the two centroids
    const bx = C.build.x * W, by = C.build.y * H, sx = C.study.x * W, sy = C.study.y * H;
    ctx.setLineDash([3, 5]); ctx.strokeStyle = col.faint; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '500 9.5px "IBM Plex Mono", monospace'; ctx.fillStyle = col.muted; ctx.textAlign = 'center';
    ctx.save(); ctx.translate((bx + sx) / 2, (by + sy) / 2); ctx.rotate(Math.atan2(sy - by, sx - bx));
    ctx.fillText('Δ  THE GAP', 0, -8); ctx.restore();
    [[bx, by, col.build, 'BUILD'], [sx, sy, col.study, 'STUDY']].forEach(([x, y, c, l]) => {
      ctx.strokeStyle = c as string; ctx.beginPath(); ctx.arc(x as number, y as number, 5, 0, 7); ctx.stroke();
      ctx.fillStyle = c as string; ctx.textAlign = 'left'; ctx.fillText(l as string, (x as number) + 10, (y as number) + 3);
    });

    // physics: drift + spring home + gentle repulsion from the query
    for (const p of pts) {
      if (!reduce) {
        p.vx += (p.hx - p.x) * 0.012 + Math.sin(t * 0.7 + p.hy * 40) * 0.00006;
        p.vy += (p.hy - p.y) * 0.012 + Math.cos(t * 0.6 + p.hx * 40) * 0.00006;
        const dx = p.x - qx, dy = p.y - qy, d2 = dx * dx + dy * dy;
        if (d2 < 0.004) { p.vx += dx * 0.02; p.vy += dy * 0.02; }
        p.vx *= 0.9; p.vy *= 0.9; p.x += p.vx; p.y += p.vy;
      }
    }

    const nn = nearest(qx, qy);
    const nnSet = new Set(nn.map((n) => n.p));

    // k-NN lines
    const qpx = qx * W, qpy = qy * H;
    nn.forEach(({ p }, i) => {
      ctx.strokeStyle = p.lane === 'build' ? col.build : col.study;
      ctx.globalAlpha = 0.55 - i * 0.08; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(qpx, qpy); ctx.lineTo(p.x * W, p.y * H); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // points
    for (const p of pts) {
      const off = lane !== 'all' && p.lane !== lane;
      ctx.globalAlpha = off ? 0.12 : p.ambient ? 0.35 : nnSet.has(p) ? 1 : 0.8;
      ctx.fillStyle = p.lane === 'build' ? col.build : col.study;
      ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p === hover ? p.r + 3 : p.r, 0, 7); ctx.fill();
      if (nnSet.has(p)) { ctx.strokeStyle = ctx.fillStyle; ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r + 5, 0, 7); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;

    // labels for the nearest three
    ctx.font = '500 11px "Inter Tight", sans-serif'; ctx.textAlign = 'left';
    nn.slice(0, 3).forEach(({ p }) => {
      const x = p.x * W + p.r + 7, y = p.y * H + 4;
      const label = p.l.length > 26 ? p.l.slice(0, 25) + '…' : p.l;
      const w = ctx.measureText(label).width;
      ctx.fillStyle = col.label; ctx.globalAlpha = 0.85;
      ctx.fillRect(x - 3, y - 11, w + 6, 15); ctx.globalAlpha = 1;
      ctx.fillStyle = col.ink; ctx.fillText(label, x, y);
    });

    // crosshair
    ctx.strokeStyle = col.ink; ctx.globalAlpha = 0.18; ctx.beginPath();
    ctx.moveTo(qpx, 0); ctx.lineTo(qpx, H); ctx.moveTo(0, qpy); ctx.lineTo(W, qpy); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeStyle = col.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(qpx, qpy, 9, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(qpx - 14, qpy); ctx.lineTo(qpx - 5, qpy); ctx.moveTo(qpx + 5, qpy); ctx.lineTo(qpx + 14, qpy);
    ctx.moveTo(qpx, qpy - 14); ctx.lineTo(qpx, qpy - 5); ctx.moveTo(qpx, qpy + 5); ctx.lineTo(qpx, qpy + 14); ctx.stroke();

    // readouts
    read.textContent = `q = (${(qx * 2 - 1).toFixed(2)}, ${(1 - qy * 2).toFixed(2)})`;
    if (nn[0]) nnEl.textContent = `nn: ${nn[0].p.k} · sim ${(1 - Math.min(1, nn[0].d * 2.2)).toFixed(2)}`;

    if (!reduce) raf = requestAnimationFrame(draw);
  };

  let raf = 0, visible = true;
  const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };

  cv.addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top; userActive = true; lastMove = performance.now();
    const hit = pts.filter((p) => !p.ambient && (lane === 'all' || p.lane === lane))
      .map((p) => ({ p, d: Math.hypot(p.x * W - mx, p.y * H - my) })).sort((a, b) => a.d - b.d)[0];
    hover = hit && hit.d < 16 ? hit.p : null;
    cv.style.cursor = hover ? 'pointer' : 'crosshair';
    if (hover) {
      tip.href = hover.h; tip.querySelector('b')!.textContent = hover.l; tip.querySelector('small')!.textContent = hover.k;
      tip.style.transform = `translate(${hover.x * W + 14}px,${hover.y * H - 40}px)`; tip.classList.add('on');
    } else tip.classList.remove('on');
    if (reduce) draw(performance.now());
  });
  cv.addEventListener('pointerleave', () => { hover = null; tip.classList.remove('on'); lastMove = 0; });
  cv.addEventListener('click', () => { if (hover) location.href = hover.h; });

  readColors(); size();
  new ResizeObserver(() => { size(); if (reduce) draw(performance.now()); }).observe(cv);
  addEventListener('themechange', () => setTimeout(() => { readColors(); if (reduce) draw(performance.now()); }, 30));
  addEventListener('lanechange', (e) => { lane = (e as CustomEvent).detail; if (reduce) draw(performance.now()); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : cancelAnimationFrame(raf); }).observe(cv);
  if (reduce) { draw(performance.now()); document.fonts?.ready.then(() => draw(performance.now())); }
}
