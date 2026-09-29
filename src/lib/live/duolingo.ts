import { live } from './core';
import { PROFILES } from '../../data/profiles';

export type Duo = { streak: number; xp: number; since: string | null; courses: { title: string; lang: string; xp: number }[]; url: string };

// Duolingo has no official public API; this is the endpoint their web profile uses.
export const duolingo = () =>
  live<Duo>('duolingo', async (get) => {
    const r = await get(`https://www.duolingo.com/2017-06-30/users?username=${PROFILES.duolingo.user}&fields=streak,streakData,totalXp,courses,creationDate`);
    const u = r?.users?.[0];
    if (!u) return null;
    return {
      streak: u.streakData?.currentStreak?.length ?? u.streak ?? 0,
      xp: u.totalXp ?? 0,
      since: u.creationDate ? new Date(u.creationDate * 1000).toISOString() : null,
      courses: (u.courses || []).map((c: any) => ({ title: c.title, lang: c.learningLanguage, xp: c.xp || 0 })).sort((a: any, b: any) => b.xp - a.xp),
      url: PROFILES.duolingo.url,
    };
  });
