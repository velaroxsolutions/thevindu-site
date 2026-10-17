// "Publish now": rebuilds the whole site (homepage ticker, last shipped, RSS) right away.
// Bookmark  https://<your-site>/api/publish?key=<PUBLISH_KEY>  on your phone, or add it as a
// Notion button. Needs VERCEL_DEPLOY_HOOK and PUBLISH_KEY set in Vercel.
import type { APIRoute } from 'astro';

export const prerender = false;

const page = (title: string, text: string, status = 200) =>
  new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<body style="font:16px system-ui;display:grid;place-items:center;min-height:90vh;margin:0;background:#0d0f14;color:#eceff4;text-align:center">
<div><h1 style="margin:0 0 8px">${title}</h1><p style="color:#9aa3b2">${text}</p><p><a href="/log" style="color:#8aa0ff">Back to the log</a></p></div>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async ({ url }) => {
  const key = process.env.PUBLISH_KEY, hook = process.env.VERCEL_DEPLOY_HOOK;
  if (!key || !hook) return page('Not set up', 'Add PUBLISH_KEY and VERCEL_DEPLOY_HOOK in Vercel first.', 501);
  if (url.searchParams.get('key') !== key) return page('Wrong key', 'That link isn’t the one from your settings.', 403);
  const r = await fetch(hook, { method: 'POST' }).catch(() => null);
  return r?.ok
    ? page('Publishing ✓', 'The site is rebuilding. Everything is updated in about a minute.')
    : page('Didn’t work', 'Vercel didn’t accept the deploy hook. Check VERCEL_DEPLOY_HOOK.', 502);
};
