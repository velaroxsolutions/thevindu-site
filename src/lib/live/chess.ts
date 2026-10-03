import { live, request } from './core';
import { PROFILES } from '../../data/profiles';

export type Chess = {
  lichess: { rapid?: number; blitz?: number; bullet?: number; classical?: number; puzzle?: number; games: number; wins: number; url: string; history: { d: string; r: number }[] } | null;
  chesscom: { rapid?: number; blitz?: number; bullet?: number; daily?: number; bestRapid?: number; tactics?: number; puzzleRush?: number; wins: number; losses: number; draws: number; url: string } | null;
};

/** The raw fetch, also used by the /api/stats function for live refreshes. */
export async function loadChess(get: typeof request): Promise<Chess | null> {
    const L = PROFILES.lichess.user, C = PROFILES.chesscom.user;
    const [lu, lh, cs] = await Promise.all([
      get(`https://lichess.org/api/user/${L}`).catch(() => null),
      get(`https://lichess.org/api/user/${L}/rating-history`).catch(() => null),
      get(`https://api.chess.com/pub/player/${C}/stats`).catch(() => null),
    ]);
    if (!lu && !cs) return null;
    let lichess: Chess['lichess'] = null;
    if (lu) {
      const p = lu.perfs || {};
      // Pick the time control with the most games for the sparkline.
      const main = ['rapid', 'blitz', 'bullet', 'classical'].sort((a, b) => (p[b]?.games || 0) - (p[a]?.games || 0))[0];
      const series = (lh || []).find((s: any) => s.name?.toLowerCase() === main)?.points || [];
      lichess = {
        rapid: p.rapid?.games ? p.rapid.rating : undefined, blitz: p.blitz?.games ? p.blitz.rating : undefined,
        bullet: p.bullet?.games ? p.bullet.rating : undefined, classical: p.classical?.games ? p.classical.rating : undefined,
        puzzle: p.puzzle?.games ? p.puzzle.rating : undefined,
        games: lu.count?.all || 0, wins: lu.count?.win || 0, url: PROFILES.lichess.url,
        history: series.slice(-60).map(([y, m, d, r]: number[]) => ({ d: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, r })),
      };
    }
    let chesscom: Chess['chesscom'] = null;
    if (cs) {
      const rec = ['chess_rapid', 'chess_blitz', 'chess_bullet', 'chess_daily'].map((k) => cs[k]?.record).filter(Boolean);
      chesscom = {
        rapid: cs.chess_rapid?.last?.rating, blitz: cs.chess_blitz?.last?.rating, bullet: cs.chess_bullet?.last?.rating,
        daily: cs.chess_daily?.last?.rating, bestRapid: cs.chess_rapid?.best?.rating,
        tactics: cs.tactics?.highest?.rating, puzzleRush: cs.puzzle_rush?.best?.score,
        wins: rec.reduce((a: number, r: any) => a + (r.win || 0), 0), losses: rec.reduce((a: number, r: any) => a + (r.loss || 0), 0),
        draws: rec.reduce((a: number, r: any) => a + (r.draw || 0), 0), url: PROFILES.chesscom.url,
      };
    }
    return { lichess, chesscom };
}

export const chess = () => live<Chess>('chess', loadChess);
