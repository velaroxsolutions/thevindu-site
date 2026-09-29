import { SITE, NAV } from '../data/site';
import { projects, notes, allBooks, allCourses, templates, templateHref } from './content';
import { github } from './live';
import { PROFILES } from '../data/profiles';

export type Cmd = { t: string; k: string; g: string; url?: string; ext?: string; act?: string; lane?: string };

/** Every page, project, note and library item — built once at compile time. */
export async function paletteCommands(): Promise<Cmd[]> {
  const [p, n, b, c, t, gh] = await Promise.all([projects(), notes(), allBooks(), allCourses(), templates(), github()]);
  return [
    { t: 'Home', k: 'page', g: 'Go to', url: '/' },
    ...NAV.map((x) => ({ t: x.label, k: 'page', g: 'Go to', url: x.href })),
    { t: 'Résumé', k: 'page', g: 'Go to', url: '/cv' },
    ...p.map((x) => ({ t: x.data.title, k: x.data.status, g: 'Projects', url: `/work/${x.id}`, lane: 'build' })),
    ...n.map((x) => ({ t: x.data.title, k: 'note', g: 'Notes', url: `/notes/${x.id}`, lane: x.data.lane })),
    ...c.map((x) => ({ t: x.name ? `${x.code} — ${x.name}` : x.code, k: 'course', g: 'Library', url: `/library/courses#${x.id}`, lane: 'study' })),
    ...t.map((x) => ({ t: x.data.title, k: x.data.kind.toLowerCase(), g: 'Library', url: templateHref(x), lane: 'build' })),
    ...b.map((x) => ({ t: x.title, k: x.verdict, g: 'Books', url: `/library/books#${x.id}`, lane: 'study' })),
    ...(gh?.repos ?? []).map((r) => ({ t: r.name, k: r.language ?? 'repo', g: 'Code', ext: r.url, lane: 'build' })),
    { t: 'Copy email address', k: 'action', g: 'Actions', act: 'copy-email' },
    { t: 'Toggle dark mode', k: 'action', g: 'Actions', act: 'theme' },
    { t: 'Show only Build', k: 'lane', g: 'Actions', act: 'lane:build' },
    { t: 'Show only Study', k: 'lane', g: 'Actions', act: 'lane:study' },
    { t: 'Show everything', k: 'lane', g: 'Actions', act: 'lane:all' },
    { t: 'Download résumé (PDF)', k: 'file', g: 'Actions', url: SITE.resumePdf },
    { t: 'Aperis on the App Store', k: 'app', g: 'Elsewhere', ext: PROFILES.appstore.url, lane: 'build' },
    { t: 'Photos', k: 'page', g: 'Go to', url: '/photos' },
    { t: 'Log', k: 'page', g: 'Go to', url: '/log' },
    ...SITE.socials.map((s) => ({ t: s.label, k: 'link', g: 'Elsewhere', ext: s.href })),
    { t: 'Lichess', k: 'chess', g: 'Elsewhere', ext: PROFILES.lichess.url },
    { t: 'Chess.com', k: 'chess', g: 'Elsewhere', ext: PROFILES.chesscom.url },
    { t: 'Duolingo', k: 'french', g: 'Elsewhere', ext: PROFILES.duolingo.url },
    { t: 'Unsplash', k: 'photos', g: 'Elsewhere', ext: PROFILES.unsplash.url },
    { t: 'Pexels', k: 'photos', g: 'Elsewhere', ext: PROFILES.pexels.url },
    { t: 'Course summaries (Notion)', k: 'notion', g: 'Elsewhere', ext: PROFILES.notion.courses.url, lane: 'study' },
    { t: 'Reading notes (Notion)', k: 'notion', g: 'Elsewhere', ext: PROFILES.notion.reading.url, lane: 'study' },
    ...PROFILES.velarox.map((v) => ({ t: v.label, k: 'velarox', g: 'Elsewhere', ext: v.url, lane: 'build' })),
    { t: 'RSS feed', k: 'feed', g: 'Elsewhere', url: '/rss.xml' },
  ];
}
