import { getCollection, type CollectionEntry } from 'astro:content';

export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  d.toLocaleDateString('en-CA', { timeZone: 'UTC', ...opts });

export const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

export async function projects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

export async function logEntries() {
  return (await getCollection('log')).sort((a, b) => +b.data.date - +a.data.date);
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

export async function libraryCounts() {
  const [b, c, t] = await Promise.all([getCollection('books'), getCollection('courses'), getCollection('templates')]);
  return {
    books: b.length,
    reading: b.filter((x) => x.data.verdict === 'Reading').length,
    courses: c.length,
    templates: t.length,
    total: b.length + c.length + t.length,
  };
}

/** Everything the library "Latest" list and the palette can point at. */
export async function libraryLatest(limit = 4) {
  const [c, t] = await Promise.all([courses(), templates()]);
  const items = [
    ...c.map((x) => ({ date: x.data.added, title: `${x.data.code} — ${x.data.name}`, text: x.data.blurb, type: 'Course', href: `/library/courses#${x.id}` })),
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
