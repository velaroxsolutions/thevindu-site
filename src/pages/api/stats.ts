// Live GitHub + chess stats, refreshed for visitors without a rebuild.
// Runs as a Vercel function; the GitHub token never leaves the server.
// Vercel's CDN caches the response for an hour, so the APIs see about one request an hour.
import type { APIRoute } from 'astro';
import { request } from '../../lib/live/core';
import { loadGitHub } from '../../lib/live/github';
import { loadChess } from '../../lib/live/chess';

export const prerender = false;

const fixture = async (name: string) => {
  const { readFile } = await import('node:fs/promises');
  return JSON.parse(await readFile(`${process.env.LIVE_FIXTURES}/${name}.json`, 'utf8'));
};

export const GET: APIRoute = async () => {
  const [github, chess] = process.env.LIVE_FIXTURES ? await Promise.all([fixture('github'), fixture('chess')]) : await Promise.all([
    loadGitHub(request).catch(() => null),
    loadChess(request).catch(() => null),
  ]);
  return new Response(JSON.stringify({ github, chess, at: new Date().toISOString() }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
