// Fresh entries from the Notion log, so something you add on your phone shows up on /log
// within a few minutes instead of at the next rebuild. Vercel caches this for 5 minutes.
import type { APIRoute } from 'astro';
import { request } from '../../lib/live/core';
import { loadNotionLog } from '../../lib/live/notionLog';

export const prerender = false;

export const GET: APIRoute = async () => {
  let entries = null;
  if (process.env.LIVE_FIXTURES) {
    const { readFile } = await import('node:fs/promises');
    entries = JSON.parse(await readFile(`${process.env.LIVE_FIXTURES}/notion-log.json`, 'utf8').catch(() => 'null'));
  } else {
    entries = await loadNotionLog(request).catch(() => null);
  }
  return new Response(JSON.stringify({ entries, at: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600' },
  });
};
