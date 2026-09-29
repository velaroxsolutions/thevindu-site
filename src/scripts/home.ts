import { $, $$, reduce, fine } from './util';

/* ---- the name: letters squeeze and thicken near the cursor ---- */
const name = $('#name');
if (name && fine && !reduce) {
  const chars = $$('.ch', name);
  let raf = 0, mx = -9999, my = -9999;
  const apply = () => {
    raf = 0;
    chars.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
      const k = Math.max(0, 1 - d / 260);
      c.style.setProperty('--wd', String(Math.round(118 - 40 * k)));
      c.style.setProperty('--wg', String(Math.round(800 + 100 * k)));
      c.classList.toggle('hot', k > 0.55);
    });
  };
  const hero = name.closest('.hero') as HTMLElement;
  hero.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(apply); });
  hero.addEventListener('pointerleave', () => { mx = my = -9999; if (!raf) raf = requestAnimationFrame(apply); });
}

/* ---- Edmonton clock + where the sun is ---- */
const clk = $('#clk');
if (clk) {
  const day = $('#clkday')!, sun = $('#sun')!, zone = $('#clkzone')!;
  const LAT = 53.55 * (Math.PI / 180);
  const tick = () => {
    const now = new Date();
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'long', month: 'short', day: 'numeric', timeZoneName: 'short' })
      .formatToParts(now).map((p) => [p.type, p.value]));
    clk.textContent = `${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}`;
    zone.textContent = parts.timeZoneName || 'MT';
    // Day length from solar declination; good to a few minutes, plenty for a sky.
    const doy = Math.floor((+now - +new Date(now.getFullYear(), 0, 0)) / 864e5);
    const dec = 23.44 * (Math.PI / 180) * Math.sin(((2 * Math.PI) / 365) * (doy - 81));
    const len = (24 / Math.PI) * Math.acos(Math.max(-1, Math.min(1, -Math.tan(LAT) * Math.tan(dec))));
    const noon = 13.5; // solar noon in Edmonton, local clock, roughly
    const h = +parts.hour % 24 + +parts.minute / 60;
    const rise = noon - len / 2, set = noon + len / 2;
    const up = h >= rise && h <= set;
    const f = up ? (h - rise) / (set - rise) : ((h - set + 24) % 24) / (24 - len);
    const x = 10 + f * 180, y = 46 - Math.sin(f * Math.PI) * (up ? 38 : -0) - (up ? 0 : -2);
    sun.setAttribute('cx', x.toFixed(1)); sun.setAttribute('cy', (up ? y : 46).toFixed(1));
    sun.classList.toggle('night', !up);
    const fmt = (v: number) => `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`;
    day.textContent = `${parts.weekday}, ${parts.month} ${parts.day} · ${up ? `sunset ~${fmt(set)}` : `sunrise ~${fmt(rise)}`} · ${len.toFixed(1)}h of daylight`;
  };
  tick(); setInterval(tick, 20000);
}
