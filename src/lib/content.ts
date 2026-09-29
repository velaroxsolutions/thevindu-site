import { getCollection, type CollectionEntry } from 'astro:content';
import { appstore, notionBooks, notionCourses } from './live';
import { PROFILES } from '../data/profiles';

export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  d.toLocaleDateString('en-CA', { timeZone: 'UTC', ...opts });

export const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

export async function projects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

export type LogEntry = { id: string; data: { date: Date; kind: CollectionEntry<'log'>['data']['kind']; text: string; project?: string } };

/** The hand-written log, plus entries derived from live sources (App Store releases). */
export async function logEntries(): Promise<LogEntry[]> {
  const [local, app] = await Promise.all([getCollection('log'), appstore()]);
  const out: LogEntry[] = local.map((e) => ({ id: e.id, data: e.data }));
  if (app) {
    const rel = new Date(app.released), upd = new Date(app.updated);
    out.push({ id: 'appstore-launch', data: { date: rel, kind: 'Shipped', project: 'Aperis', text: `${app.name} launched on the App Store.` } });
    if (+upd - +rel > 864e5) out.push({ id: 'appstore-version', data: { date: upd, kind: 'Shipped', project: 'Aperis', text: `${app.name} ${app.version} is out${app.notes ? ' — ' + app.notes.split('\n')[0].replace(/[.\s]+$/, '') : ''}.` } });
  }
  return out.sort((a, b) => +b.data.date - +a.data.date);
}

export async function notes() {
  return (await getCollection('notes', (n) => import.meta.env.DEV || !n.data.draft)).sort(
    (a, b) => +b.data.date - +a.data.date,
  );
}

const VERDICT_ORDER = ['Reading', 'Worth it', 'Mixed', 'Skim it', 'Shelved'];
export async function books() {
  return (await getCollection('books')).sort(
    (a, b) =>
      VERDICT_ORDER.indexOf(a.data.verdict) - VERDICT_ORDER.indexOf(b.data.verdict) ||
      a.data.title.localeCompare(b.data.title),
  );
}

export async function courses() {
  return (await getCollection('courses')).sort((a, b) => +b.data.added - +a.data.added);
}

export async function templates() {
  return (await getCollection('templates')).sort((a, b) => +b.data.added - +a.data.added);
}

export async function skills() {
  return (await getCollection('skills')).map((s) => s.data).sort((a, b) => b.level - a.level);
}

/* ---------- Books: local markdown + the Notion reading database ---------- */
export type Book = { id: string; title: string; author: string; verdict: string; take?: string; quote?: string; cover?: string; href?: string; featured: boolean; source: 'local' | 'notion' };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const READING = /reading|progress|current|started|now/i;

export async function allBooks(): Promise<Book[]> {
  const [local, remote] = await Promise.all([books(), notionBooks()]);
  const out: Book[] = local.map((b) => ({ id: b.id, ...b.data, source: 'local' as const }));
  const seen = new Set(out.map((b) => norm(b.title)));
  for (const r of remote ?? []) {
    const key = norm(r.title);
    const existing = out.find((b) => norm(b.title) === key);
    if (existing) { existing.href ??= r.url; existing.cover ??= r.cover ?? undefined; existing.take ??= r.take || undefined; continue; }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: 'n-' + key.slice(0, 40), title: r.title, author: r.author, featured: false, source: 'notion',
      verdict: READING.test(r.status) ? 'Reading' : r.status || 'Read', take: r.take || undefined, cover: r.cover ?? undefined, href: r.url,
    });
  }
  const order = ['Reading', 'Worth it', 'Mixed', 'Skim it', 'Shelved'];
  const rank = (v: string) => (order.indexOf(v) + 1 || order.length + 1);
  return out.sort((a, b) => rank(a.verdict) - rank(b.verdict) || a.title.localeCompare(b.title));
}

/* ---------- Courses: local markdown + Notion course summaries ---------- */
export type Course = { id: string; code: string; name: string; blurb: string; pages?: number; pdf?: string; href?: string; icon?: string | null; added: Date; source: 'local' | 'notion' };
export async function allCourses(): Promise<Course[]> {
  const [local, remote] = await Promise.all([courses(), notionCourses()]);
  const out: Course[] = local.map((c) => ({ id: c.id, ...c.data, source: 'local' as const }));
  for (const r of remote ?? []) {
    const m = r.title.match(/^([A-Z]{2,6}\s?\d{3}[A-Z]?)\s*[-—:–]?\s*(.*)$/);
    const code = m ? m[1] : r.title, name = m ? m[2] : '';
    const existing = out.find((c) => norm(c.code) === norm(code));
    if (existing) { existing.href ??= r.url; continue; }
    out.push({ id: 'n-' + norm(r.title).slice(0, 40), code, name, blurb: r.blurb, href: r.url, icon: r.icon, added: new Date(r.updated), source: 'notion' });
  }
  // Anything without a PDF or its own page points at the public Notion index.
  out.forEach((c) => { if (!c.pdf) c.href ??= PROFILES.notion.courses.url; });
  return out.sort((a, b) => +b.added - +a.added);
}

export async function libraryCounts() {
  const [b, c, t] = await Promise.all([allBooks(), allCourses(), getCollection('templates')]);
  return {
    books: b.length,
    reading: b.filter((x) => x.verdict === 'Reading').length,
    courses: c.length,
    templates: t.length,
    total: b.length + c.length + t.length,
  };
}

/** Everything the library "Latest" list and the palette can point at. */
export async function libraryLatest(limit = 4) {
  const [c, t] = await Promise.all([allCourses(), templates()]);
  const items = [
    ...c.map((x) => ({ date: x.added, title: x.name ? `${x.code} — ${x.name}` : x.code, text: x.blurb, type: 'Course', href: `/library/courses#${x.id}` })),
    ...t.map((x) => ({ date: x.data.added, title: x.data.title, text: x.data.blurb, type: 'Template', href: templateHref(x) })),
  ];
  return items.sort((a, b) => +b.date - +a.date).slice(0, limit);
}

export const templateHref = (t: CollectionEntry<'templates'>) => t.data.href ?? `/library/templates/${t.id}`;
export const templateIsExternal = (t: CollectionEntry<'templates'>) => !!t.data.href;

/** Deterministic hash → used for generated covers and field positions. */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
