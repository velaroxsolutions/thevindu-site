import { live, token } from './core';
import { PROFILES } from '../../data/profiles';

const U = PROFILES.github.user;
const auth = (): Record<string, string> => { const t = token('GITHUB_TOKEN'); return t ? { Authorization: `Bearer ${t}` } : {}; };

export type Repo = { name: string; description: string | null; language: string | null; stars: number; forks: number; pushed: string; url: string; homepage: string | null; topics: string[] };
export type GitHub = {
  profile: { name: string | null; bio: string | null; repos: number; followers: number; since: string; avatar: string };
  repos: Repo[];
  activity: { type: string; repo: string; at: string; text: string }[];
  calendar: { total: number; days: { d: string; c: number }[] } | null;
};

const describe = (e: any): string | null => {
  const r = e.repo?.name?.replace(`${U}/`, '') ?? '';
  switch (e.type) {
    case 'PushEvent': {
      const msg = e.payload?.commits?.at?.(-1)?.message?.split('\n')[0];
      return msg ? `${msg}` : `Pushed to ${r}`;
    }
    case 'PullRequestEvent': return `${e.payload?.action === 'closed' && e.payload?.pull_request?.merged ? 'Merged' : cap(e.payload?.action)} PR: ${e.payload?.pull_request?.title ?? ''}`;
    case 'CreateEvent': return e.payload?.ref_type === 'repository' ? `Created ${r}` : null;
    case 'ReleaseEvent': return `Released ${e.payload?.release?.tag_name ?? ''}`;
    case 'IssuesEvent': return `${cap(e.payload?.action)} issue: ${e.payload?.issue?.title ?? ''}`;
    case 'WatchEvent': return null;
    default: return null;
  }
};
const cap = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : '');

export const github = () =>
  live<GitHub>('github', async (get) => {
    const h = { headers: auth() };
    const [user, repos, events] = await Promise.all([
      get(`https://api.github.com/users/${U}`, h),
      get(`https://api.github.com/users/${U}/repos?per_page=100&sort=pushed`, h),
      get(`https://api.github.com/users/${U}/events/public?per_page=60`, h).catch(() => []),
    ]);
    let calendar: GitHub['calendar'] = null;
    if (token('GITHUB_TOKEN')) {
      // The contribution calendar is only available through GraphQL (needs any token).
      const q = `query{user(login:"${U}"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
      const g = await get('https://api.github.com/graphql', { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) }).catch(() => null);
      const cal = g?.data?.user?.contributionsCollection?.contributionCalendar;
      if (cal) calendar = { total: cal.totalContributions, days: cal.weeks.flatMap((w: any) => w.contributionDays.map((d: any) => ({ d: d.date, c: d.contributionCount }))) };
    }
    if (!calendar && Array.isArray(events) && events.length) {
      // Without a token, approximate from public events (last ~90 days).
      const m = new Map<string, number>();
      events.forEach((e: any) => { const d = e.created_at.slice(0, 10); m.set(d, (m.get(d) || 0) + (e.payload?.size || e.payload?.commits?.length || 1)); });
      const days: { d: string; c: number }[] = [];
      for (let i = 181; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10); days.push({ d, c: m.get(d) || 0 }); }
      calendar = { total: [...m.values()].reduce((a, b) => a + b, 0), days };
    }
    return {
      profile: { name: user.name, bio: user.bio, repos: user.public_repos, followers: user.followers, since: user.created_at, avatar: user.avatar_url },
      repos: (repos as any[]).filter((r) => !r.fork && !r.archived && r.name !== U).map((r) => ({
        name: r.name, description: r.description, language: r.language, stars: r.stargazers_count, forks: r.forks_count,
        pushed: r.pushed_at, url: r.html_url, homepage: r.homepage || null, topics: r.topics || [],
      })),
      activity: (Array.isArray(events) ? events : []).map((e: any) => ({ type: e.type, repo: e.repo?.name ?? '', at: e.created_at, text: describe(e) }))
        .filter((a: any) => a.text).slice(0, 12) as GitHub['activity'],
      calendar,
    };
  });
