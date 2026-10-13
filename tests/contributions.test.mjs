// npx esbuild tests/contributions.test.mjs --bundle --platform=node --format=esm --outfile=/tmp/t.mjs && node /tmp/t.mjs
// Feeds parseProfileCalendar markup shaped like github.com/users/<u>/contributions
// (as of 2026) and checks it reads the counts, levels and total exactly.
import assert from 'node:assert/strict';
const { parseProfileCalendar } = await import('../src/lib/live/contributions.ts');

const end = new Date(Date.UTC(2026, 9, 12));
const start = new Date(end); start.setUTCDate(start.getUTCDate() - 364 - end.getUTCDay());
const days = [];
for (let t = new Date(start); t <= end; t.setUTCDate(t.getUTCDate() + 1)) {
  const i = days.length, c = i % 11 === 0 ? 12 : i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 0;
  days.push({ d: t.toISOString().slice(0, 10), c, l: c === 0 ? 0 : c >= 12 ? 4 : c >= 3 ? 2 : 1 });
}
const total = days.reduce((a, x) => a + x.c, 0);
const ord = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
const html = `<h2 class="f4 text-normal mb-2">\n  ${total.toLocaleString('en-US')}\n  contributions\n        in the last year\n</h2><table class="ContributionCalendar-grid"><tbody>` +
  days.map((x, i) => `<td tabindex="0" data-ix="${i}" aria-selected="false" aria-describedby="contribution-graph-legend-level-${x.l}" style="width: 10px" data-date="${x.d}" id="contribution-day-component-${i % 7}-${Math.floor(i / 7)}" data-level="${x.l}" role="gridcell" data-view-component="true" class="ContributionCalendar-day"></td>` +
    `<tool-tip id="tooltip-${i}" for="contribution-day-component-${i % 7}-${Math.floor(i / 7)}" popover="manual" data-direction="n" data-type="label" data-view-component="true" class="sr-only position-absolute">${x.c ? `${x.c} contribution${x.c > 1 ? 's' : ''}` : 'No contributions'} on ${['January','February','March','April','May','June','July','August','September','October','November','December'][+x.d.slice(5, 7) - 1]} ${ord(+x.d.slice(8))}.</tool-tip>`).join('') +
  `</tbody></table>`;

const r = parseProfileCalendar(html);
assert.ok(r, 'parsed');
assert.equal(r.total, total);
assert.equal(r.days.length, days.length);
assert.deepEqual(r.days, days);
assert.equal(parseProfileCalendar('<html>rate limited</html>'), null);
// Comma totals ("1,234 contributions in 2025")
assert.equal(parseProfileCalendar(html.replace(/\d[\d,]*\n  contributions\n        in the last year/, '1,234 contributions in 2025')).total, 1234);
console.log(`ok — ${r.days.length} days, ${r.total} contributions`);
