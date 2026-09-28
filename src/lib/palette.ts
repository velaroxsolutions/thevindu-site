import { SITE, NAV } from '../data/site';
import { projects, notes, books, courses, templates, templateHref } from './content';

export type Cmd = { t: string; k: string; g: string; url?: string; ext?: string; act?: string; lane?: string };

/** Every page, project, note and library item — built once at compile time. */
export async function paletteCommands(): Promise<Cmd[]> {
  const [p, n, b, c, t] = await Promise.all([projects(), notes(), books(), courses(), templates()]);
  return [
    { t: 'Home', k: 'page', g: 'Go to', url: '/' },
    ...NAV.map((x) => ({ t: x.label, k: 'page', g: 'Go to', url: x.href })),
    { t: 'Résumé', k: 'page', g: 'Go to', url: '/cv' },
    ...p.map((x) => ({ t: x.data.title, k: x.data.status, g: 'Projects', url: `/work/${x.id}`, lane: 'build' })),
    ...n.map((x) => ({ t: x.data.title, k: 'note', g: 'Notes', url: `/notes/${x.id}`, lane: x.data.lane })),
    ...c.map((x) => ({ t: `${x.data.code} — ${x.data.name}`, k: 'course', g: 'Library', url: `/library/courses#${x.id}`, lane: 'study' })),
    ...t.map((x) => ({ t: x.data.title, k: x.data.kind.toLowerCase(), g: 'Library', url: templateHref(x), lane: 'build' })),
    ...b.map((x) => ({ t: x.data.title, k: x.data.verdict, g: 'Books', url: `/library/books#${x.id}`, lane: 'study' })),
    { t: 'Copy email address', k: 'action', g: 'Actions', act: 'copy-email' },
    { t: 'Toggle dark mode', k: 'action', g: 'Actions', act: 'theme' },
    { t: 'Show only Build', k: 'lane', g: 'Actions', act: 'lane:build' },
    { t: 'Show only Study', k: 'lane', g: 'Actions', act: 'lane:study' },
    { t: 'Show everything', k: 'lane', g: 'Actions', act: 'lane:all' },
    { t: 'Download résumé (PDF)', k: 'file', g: 'Actions', url: SITE.resumePdf },
    ...SITE.socials.map((s) => ({ t: s.label, k: 'link', g: 'Elsewhere', ext: s.href })),
    { t: 'RSS feed', k: 'feed', g: 'Elsewhere', url: '/rss.xml' },
  ];
}
