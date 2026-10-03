// Build-time data fetching with three layers of safety:
//  1. live request (timeout, one retry)
//  2. snapshot in src/data/snapshots/<key>.json (refreshed by `npm run sync`)
//  3. null — every component treats null as "hide or show the static fallback"
// Set LIVE_FIXTURES=<dir> to read <dir>/<key>.json instead of the network (tests, offline dev).
// Set LIVE=0 to skip the network entirely and use snapshots.
import fs from 'node:fs';
import path from 'node:path';

const SNAP_DIR = path.resolve('src/data/snapshots');
const memo = new Map<string, Promise<any>>();
const env = (k: string) => process.env[k] ?? (import.meta as any).env?.[k];

export const status: Record<string, 'live' | 'snapshot' | 'fixture' | 'missing'> = {};

export async function request(url: string, init: RequestInit = {}, timeout = 8000) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { 'User-Agent': 'thevindu-site (build)', Accept: 'application/json', ...(init.headers || {}) } });
      if (res.status === 404) throw new Error('404');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (attempt === 1 || (e as Error).message === '404') throw e;
    } finally {
      clearTimeout(t);
    }
  }
}

function readJSON(file: string) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

/**
 * Fetch once per build. `load` does the network work and returns the final,
 * already-shaped data (keep snapshots small — never store raw API responses).
 */
export function live<T>(key: string, load: (get: typeof request) => Promise<T | null>): Promise<T | null> {
  if (memo.has(key)) return memo.get(key)!;
  const p = (async () => {
    const fixtures = env('LIVE_FIXTURES');
    if (fixtures) {
      const d = readJSON(path.resolve(fixtures, `${key}.json`));
      status[key] = d ? 'fixture' : 'missing';
      return d;
    }
    const snapFile = path.join(SNAP_DIR, `${key}.json`);
    if (env('LIVE') !== '0') {
      try {
        const d = await load(request);
        if (d != null) {
          status[key] = 'live';
          if (env('SNAPSHOT') === '1') {
            fs.mkdirSync(SNAP_DIR, { recursive: true });
            fs.writeFileSync(snapFile, JSON.stringify({ fetchedAt: new Date().toISOString(), data: d }, null, 1));
          }
          return d;
        }
      } catch (e) {
        console.warn(`[live] ${key}: ${(e as Error).message} — using snapshot`);
      }
    }
    const snap = readJSON(snapFile);
    status[key] = snap ? 'snapshot' : 'missing';
    return (snap?.data ?? null) as T | null;
  })();
  memo.set(key, p);
  return p;
}

export const token = (k: string) => (env(k) || '').trim() || null;
