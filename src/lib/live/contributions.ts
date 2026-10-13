// The contribution calendar, taken from the same data GitHub draws on your profile.
//
//  1. GraphQL contributionsCollection (needs GITHUB_TOKEN)  → exact calendar + monthly activity
//  2. github.com/users/<u>/contributions (no token)          → the HTML fragment GitHub serves
//     for the profile graph; same cells, same counts, same levels
//  3. nothing — the caller shows recent public activity instead, labelled as such
import { token, request } from './core';
import { PROFILES } from '../../data/profiles';

const U = PROFILES.github.user;

export type Day = { d: string; c: number | null; l: 0 | 1 | 2 | 3 | 4 };
export type Contributions = {
  source: 'graphql' | 'profile';
  total: number;
  days: Day[]; // oldest → newest, the exact window GitHub shows (about 53 weeks)
  activity: { month: string; commits: number; repos: { name: string; url: string; commits: number }[] } | null;
};

const LEVEL: Record<string, Day['l']> = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function viaGraphQL(get: typeof request): Promise<Contributions | null> {
  const t = token('GITHUB_TOKEN');
  if (!t) return null;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const query = `query($login:String!,$from:DateTime!){user(login:$login){
    calendar: contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}
    month: contributionsCollection(from:$from){totalCommitContributions commitContributionsByRepository(maxRepositories:6){repository{nameWithOwner url} contributions{totalCount}}}
  }}`;
  const r = await get('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: U, from: monthStart } }),
  });
  const cal = r?.data?.user?.calendar?.contributionCalendar;
  if (!cal) return null;
  const m = r.data.user.month;
  return {
    source: 'graphql',
    total: cal.totalContributions,
    days: cal.weeks.flatMap((w: any) => w.contributionDays.map((d: any) => ({ d: d.date, c: d.contributionCount, l: LEVEL[d.contributionLevel] ?? 0 }))),
    activity: m ? {
      month: now.toLocaleString('en-CA', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      commits: m.totalCommitContributions,
      repos: m.commitContributionsByRepository.map((x: any) => ({ name: x.repository.nameWithOwner, url: x.repository.url, commits: x.contributions.totalCount })),
    } : null,
  };
}

/** Parse the profile-graph fragment. Tolerant of attribute order; returns null if it doesn't look right. */
export function parseProfileCalendar(html: string): Contributions | null {
  const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attr(m[1], 'for'), text = m[2].trim();
    if (!id) continue;
    const n = /^No contributions/i.test(text) ? 0 : Number(text.match(/^([\d,]+)\s+contributions?/i)?.[1]?.replace(/,/g, ''));
    if (!Number.isNaN(n)) counts.set(id, n);
  }
  const days: Day[] = [];
  for (const m of html.matchAll(/<td\b([^>]*)>/g)) {
    const tag = m[1];
    if (!/ContributionCalendar-day/.test(tag)) continue;
    const d = attr(tag, 'data-date'), l = Number(attr(tag, 'data-level'));
    if (!d || Number.isNaN(l)) continue;
    const id = attr(tag, 'id');
    // Older markup put the count straight on the cell.
    const inline = attr(tag, 'data-count');
    const c = id && counts.has(id) ? counts.get(id)! : inline != null ? Number(inline) : null;
    days.push({ d, c, l: Math.max(0, Math.min(4, l)) as Day['l'] });
  }
  if (days.length < 300) return null; // not the full-year graph — markup changed or the request was blocked
  days.sort((a, b) => a.d.localeCompare(b.d));
  const heading = html.match(/([\d,]+)\s+contributions?\s+in\s+(?:the\s+last\s+year|\d{4})/i)?.[1];
  const summed = days.every((x) => x.c != null) ? days.reduce((a, x) => a + (x.c ?? 0), 0) : null;
  const total = heading ? Number(heading.replace(/,/g, '')) : summed;
  if (total == null) return null;
  return { source: 'profile', total, days, activity: null };
}

async function viaProfile(get: typeof request): Promise<Contributions | null> {
  const html: string = await get(`https://github.com/users/${U}/contributions`, { headers: { Accept: 'text/html' } }, 10000, 'text');
  return parseProfileCalendar(html);
}

export async function loadContributions(get: typeof request): Promise<Contributions | null> {
  try { const g = await viaGraphQL(get); if (g) return g; } catch (e) { console.warn(`[live] contributions via GraphQL: ${(e as Error).message}`); }
  try { const p = await viaProfile(get); if (p) return p; } catch (e) { console.warn(`[live] contributions via profile: ${(e as Error).message}`); }
  return null;
}
