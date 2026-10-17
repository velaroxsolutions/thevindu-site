import { getCollection, type CollectionEntry } from 'astro:content';
import { appstore, notionBooks, photos, notionCourseIndex, notionHTML, normId } from './live';
import { bookCovers } from './live/covers';
import { notionLog } from './live/notionLog';
import { github, duolingo } from './live';
import { NOW } from '../data/now';
import STORED from '../data/covers.json';

// Covers saved in the repo by scripts/fetch-covers.mjs (public/covers). Fast, same-origin.
type Stored = { file: string | null; pages: number | null; description: string | null; color: string | null };
const stored = STORED as Record<string, Stored>;
import { PROFILES } from '../data/profiles';
import { localPhotos } from './localPhotos';

export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  d.toLocaleDateString('en-CA', { timeZone: 'UTC', ...opts });

export const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

export async function projects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

export type LogEntry = {
  id: string;
  /** where it came from: the yaml file, the Notion log, or added automatically from a live source */
  source: 'file' | 'notion' | 'auto';
  data: { date: Date; kind: string; text: string; project?: string; link?: string };
};
export const LOG_KINDS = ['Shipped', 'Started', 'Learned', 'Broke', 'Stuck', 'Reading', 'Milestone'] as const;

const sameDay = (a: Date, b: Date) => Math.abs(+a - +b) < 864e5 * 3;
const MILESTONES = [30, 50, 100, 150, 200, 250, 300, 365, 500, 730, 1000];

/** Every log entry: log.yaml + the Notion log (from your phone) + things that log themselves. */
export async function logEntries(): Promise<LogEntry[]> {
  const [local, notion, app, gh, duo] = await Promise.all([getCollection('log'), notionLog(), appstore(), github(), duolingo()]);
  const out: LogEntry[] = [
    ...local.map((e) => ({ id: e.id, source: 'file' as const, data: e.data })),
    ...(notion ?? []).map((e) => ({ id: e.id, source: 'notion' as const, data: { date: new Date(e.date), kind: e.kind, text: e.text, project: e.project, link: e.link } })),
  ];
  const mentions = (project: string) => out.some((e) => e.data.project?.toLowerCase() === project.toLowerCase());
  const auto = (id: string, data: LogEntry['data']) => out.push({ id, source: 'auto', data });

  // App Store: launch and the latest release.
  if (app) {
    const rel = new Date(app.released), upd = new Date(app.updated);
    auto('appstore-launch', { date: rel, kind: 'Shipped', project: 'Aperis', text: `${app.name} launched on the App Store.`, link: app.url });
    if (+upd - +rel > 864e5) auto(`appstore-${app.version}`, { date: upd, kind: 'Shipped', project: 'Aperis', link: app.url, text: `${app.name} ${app.version} is out${app.notes ? ' — ' + app.notes.split('\n')[0].replace(/[.\s]+$/, '') : ''}.` });
  }
  // GitHub: a new public repo, unless you already logged that project yourself.
  for (const r of gh?.repos ?? []) {
    if (!r.created || mentions(r.name) || out.some((e) => e.data.text.toLowerCase().includes(r.name.toLowerCase()) && sameDay(e.data.date, new Date(r.created!)))) continue;
    auto(`gh-${r.name}`, { date: new Date(r.created), kind: 'Started', project: r.name, link: r.url, text: `Put ${r.name} up on GitHub${r.description ? ` — ${r.description.replace(/[.\s]+$/, '')}` : ''}.` });
  }
  // Duolingo: streak milestones, dated from when the streak started.
  const start = duo?.streakStart ?? (NOW.panel.duolingo.streakStart || null);
  if (start) {
    const days = Math.floor((Date.now() - Date.parse(start + 'T00:00:00')) / 864e5) + 1;
    for (const m of MILESTONES.filter((m) => m <= days))
      auto(`duo-${m}`, { date: new Date(Date.parse(start + 'T12:00:00') + (m - 1) * 864e5), kind: 'Milestone', project: 'French', text: `${m}-day Duolingo streak.` });
  }
  return out.sort((a, b) => +b.data.date - +a.data.date);
}

const VERDICT_ORDER = ['Reading', 'Worth it', 'Read', 'Mixed', 'Skim it', 'Shelved', 'Want to read'];
// Skip the lookup (and Astro's empty-collection warning) until the first book file exists.
const HAS_BOOKS = Object.keys(import.meta.glob('../content/books/*.md')).length > 0;
export async function books() {
  if (!HAS_BOOKS) return [];
  return (await getCollection('books')).sort(
    (a, b) =>
      VERDICT_ORDER.indexOf(a.data.verdict) - VERDICT_ORDER.indexOf(b.data.verdict) ||
      a.data.title.localeCompare(b.data.title),
  );
}

// Same order as the Notion "Course summaries" page. New categories go to the end.
const CATEGORY_ORDER = ['Artificial Intelligence & Prompt Engineering', 'Branding and Entrepreneurship', 'Coding (general)', 'College', 'Full-Stack Creative'];
const catRank = (c: string) => { const i = CATEGORY_ORDER.indexOf(c); return i < 0 ? 99 : i; };

/** Completed courses grouped by category; certificates first within each. */
export async function courses() {
  return (await getCollection('courses')).sort((a, b) =>
    catRank(a.data.category) - catRank(b.data.category) ||
    a.data.category.localeCompare(b.data.category) ||
    Number(b.data.certificate) - Number(a.data.certificate) ||
    a.data.title.localeCompare(b.data.title));
}

export async function skills() {
  return (await getCollection('skills')).map((s) => s.data).sort((a, b) => b.level - a.level);
}

/* ---------- Books: local markdown + the Notion reading database ---------- */
export type Book = { id: string; title: string; author: string; verdict: string; take?: string; quote?: string; cover?: string; pages?: number; isbn?: string; description?: string; color?: string; href?: string; summary?: string; notion?: string; featured: boolean; source: 'local' | 'notion' };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const READING = /reading|progress|current|started|now/i;

export async function allBooks(): Promise<Book[]> {
  const local = await books();
  const [remote, found] = await Promise.all([
    notionBooks(),
    // Only look up books that don't have a stored cover yet.
    bookCovers(local.filter((b) => !stored[b.id]?.file).map((b) => ({ id: b.id, title: b.data.title, author: b.data.author, isbn: b.data.isbn }))),
  ]);
  const out: Book[] = local.map((b) => {
    const st = stored[b.id];
    return {
      id: b.id, ...b.data, href: b.data.summary, source: 'local' as const,
      cover: b.data.cover ?? st?.file ?? found?.[b.id]?.cover ?? undefined,
      pages: b.data.pages ?? st?.pages ?? found?.[b.id]?.pages ?? undefined,
      description: st?.description ?? found?.[b.id]?.description ?? undefined,
      color: st?.color ?? undefined,
    };
  });
  const seen = new Set(out.map((b) => norm(b.title)));
  for (const r of remote ?? []) {
    const key = norm(r.title);
    const existing = out.find((b) => norm(b.title) === key);
    if (existing) { existing.href ??= r.url; if (r.cover && !local.find((l) => l.id === existing.id)?.data.cover && !stored[existing.id]?.file) existing.cover = r.cover; existing.take ??= r.take || undefined; continue; }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: 'n-' + key.slice(0, 40), title: r.title, author: r.author, featured: false, source: 'notion',
      verdict: READING.test(r.status) ? 'Reading' : r.status || 'Read', take: r.take || undefined, cover: r.cover ?? undefined, href: r.url,
    });
  }
  const order = VERDICT_ORDER;
  const rank = (v: string) => (order.indexOf(v) + 1 || order.length + 1);
  return out.sort((a, b) => rank(a.verdict) - rank(b.verdict) || a.title.localeCompare(b.title));
}

export async function libraryCounts() {
  const [b, c, p, mine] = await Promise.all([allBooks(), courses(), photos(), localPhotos()]);
  const books = b.length, crs = c.length, pics = mine.length + (p?.photos.length ?? 0);
  return { books, reading: b.filter((x) => x.verdict === 'Reading').length, courses: crs, photos: pics, total: books + crs + pics };
}

/** Deterministic hash → used for generated covers and field positions. */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ---------- Notes: my Notion summaries, rendered on this site ---------- */
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'your', 'complete'].includes(w));
const similar = (a: string, b: string) => {
  const A = new Set(words(a)), B = words(b);
  if (!A.size || !B.length) return 0;
  return B.filter((w) => A.has(w)).length / Math.max(A.size, B.length);
};

/** courseId → Notion page id, by explicit `notion:` or best title match in the Course summaries index. */
export async function courseNotionIds() {
  const [cs, index] = await Promise.all([courses(), notionCourseIndex()]);
  const map = new Map<string, string>();
  for (const c of cs) {
    if (c.data.notion) { map.set(c.id, normId(c.data.notion)); continue; }
    const best = (index ?? []).map((e) => ({ e, s: similar(c.data.title, e.title) })).sort((a, b) => b.s - a.s)[0];
    if (best && best.s >= 0.5) map.set(c.id, best.e.id);
  }
  return map;
}

export type NoteRef = { slug: string; kind: 'course' | 'book'; title: string; notionId: string; back: string };
/** Every book/course whose Notion summary can be rendered on-site. */
export async function noteRefs(): Promise<NoteRef[]> {
  const [bs, cs, ids] = await Promise.all([books(), courses(), courseNotionIds()]);
  const refs: NoteRef[] = [
    ...bs.filter((b) => b.data.notion).map((b) => ({ slug: `book-${b.id}`, kind: 'book' as const, title: b.data.title, notionId: normId(b.data.notion!), back: `/library/books#${b.id}` })),
    ...cs.filter((c) => ids.has(c.id)).map((c) => ({ slug: `course-${c.id}`, kind: 'course' as const, title: c.data.title, notionId: ids.get(c.id)!, back: `/library/courses#${c.id}` })),
  ];
  const ok = await Promise.all(refs.map(async (r) => !!(await notionHTML(r.notionId))));
  return refs.filter((_, i) => ok[i]);
}
export const notionPublicUrl = (id: string) => `${PROFILES.notion.site}/${normId(id)}`;
