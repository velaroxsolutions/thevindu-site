import { live, token, request } from './core';
import { PROFILES } from '../../data/profiles';
import { loadContributions, type Contributions } from './contributions';

const U = PROFILES.github.user;
const auth = (): Record<string, string> => { const t = token('GITHUB_TOKEN'); return t ? { Authorization: `Bearer ${t}` } : {}; };

export type Repo = { name: string; description: string | null; language: string | null; stars: number; forks: number; pushed: string; created?: string; url: string; homepage: string | null; topics: string[] };
export type GitHub = {
  profile: { name: string | null; bio: string | null; repos: number; followers: number; since: string; avatar: string } | null;
  repos: Repo[];
  activity: { type: string; repo: string; at: string; text: string }[];
  /** The real calendar (same as the profile graph), or null if neither source answered. */
  contrib: Contributions | null;
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

/** The raw fetch, also used by the /api/stats function for live refreshes.
 *  Each part is independent: a rate-limited REST call never takes the calendar down with it. */
export async function loadGitHub(get: typeof request): Promise<GitHub | null> {
  const h = { headers: auth() };
  const [user, repos, events, contrib] = await Promise.all([
    get(`https://api.github.com/users/${U}`, h).catch(() => null),
    get(`https://api.github.com/users/${U}/repos?per_page=100&sort=pushed`, h).catch(() => null),
    get(`https://api.github.com/users/${U}/events/public?per_page=60`, h).catch(() => null),
    loadContributions(get),
  ]);
  if (!user && !repos && !events && !contrib) return null;
  return {
    profile: user ? { name: user.name, bio: user.bio, repos: user.public_repos, followers: user.followers, since: user.created_at, avatar: user.avatar_url } : null,
    repos: (Array.isArray(repos) ? repos : []).filter((r: any) => !r.fork && !r.archived && r.name !== U).map((r: any) => ({
      name: r.name, description: r.description, language: r.language, stars: r.stargazers_count, forks: r.forks_count,
      pushed: r.pushed_at, created: r.created_at, url: r.html_url, homepage: r.homepage || null, topics: r.topics || [],
    })),
    activity: (Array.isArray(events) ? events : []).map((e: any) => ({ type: e.type, repo: e.repo?.name ?? '', at: e.created_at, text: describe(e) }))
      .filter((a: any) => a.text).slice(0, 12) as GitHub['activity'],
    contrib,
  };
}

export const github = () => live<GitHub>('github', loadGitHub);
