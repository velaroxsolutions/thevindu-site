import { $$ } from './util';

/* ---- relative dates, computed in the browser so static pages stay fresh ---- */
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
$$('[data-ago]').forEach((el) => {
  const days = Math.round((Date.now() - +new Date(el.dataset.ago!)) / 864e5);
  if (Number.isNaN(days)) return;
  el.textContent = days < 1 ? 'today' : days < 45 ? rtf.format(-days, 'day') : days < 540 ? rtf.format(-Math.round(days / 30), 'month') : rtf.format(-Math.round(days / 365), 'year');
  el.setAttribute('title', new Date(el.dataset.ago!).toDateString());
});
