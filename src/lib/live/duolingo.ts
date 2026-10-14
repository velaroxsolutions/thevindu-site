import { live, request } from './core';
import { PROFILES } from '../../data/profiles';

export type Duo = { streak: number; streakStart: string | null; xp: number; since: string | null; courses: { title: string; lang: string; xp: number }[]; url: string };

// Duolingo has no official public API; this is the endpoint their web profile uses.
// Send a browser user agent; the endpoint can refuse ones that don't look like a browser.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

/** The raw fetch, also used by the /api/stats function so the streak stays current between builds. */
export async function loadDuolingo(get: typeof request): Promise<Duo | null> {
    // Ask for the whole user object rather than a `fields=` subset; it's the shape their own profile page reads.
    const r = await get(`https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(PROFILES.duolingo.user)}`, { headers: { 'User-Agent': UA } });
    const u = r?.users?.[0];
    if (!u) return null;
    const cur = u.streakData?.currentStreak;
    return {
      // Duolingo returns the streak in two places; take the higher in case one hasn't caught up.
      streak: Math.max(cur?.length ?? 0, u.streak ?? 0),
      streakStart: cur?.startDate ?? null,
      xp: u.totalXp ?? 0,
      since: u.creationDate ? new Date(u.creationDate * 1000).toISOString() : null,
      courses: (u.courses || []).map((c: any) => ({ title: c.title, lang: c.learningLanguage, xp: c.xp || 0 })).sort((a: any, b: any) => b.xp - a.xp),
      url: PROFILES.duolingo.url,
    };
}

export const duolingo = () => live<Duo>('duolingo', loadDuolingo);
