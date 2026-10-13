import { live, request } from './core';
import { PROFILES } from '../../data/profiles';

export type Duo = { streak: number; xp: number; since: string | null; courses: { title: string; lang: string; xp: number }[]; url: string };

// Duolingo has no official public API; this is the endpoint their web profile uses.
// Send a browser user agent; the endpoint can refuse ones that don't look like a browser.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

/** The raw fetch, also used by the /api/stats function so the streak stays current between builds. */
export async function loadDuolingo(get: typeof request): Promise<Duo | null> {
    const r = await get(`https://www.duolingo.com/2017-06-30/users?username=${PROFILES.duolingo.user}&fields=streak,streakData,totalXp,courses,creationDate`, { headers: { 'User-Agent': UA } });
    const u = r?.users?.[0];
    if (!u) return null;
    return {
      streak: u.streakData?.currentStreak?.length ?? u.streak ?? 0,
      xp: u.totalXp ?? 0,
      since: u.creationDate ? new Date(u.creationDate * 1000).toISOString() : null,
      courses: (u.courses || []).map((c: any) => ({ title: c.title, lang: c.learningLanguage, xp: c.xp || 0 })).sort((a: any, b: any) => b.xp - a.xp),
      url: PROFILES.duolingo.url,
    };
}

export const duolingo = () => live<Duo>('duolingo', loadDuolingo);
