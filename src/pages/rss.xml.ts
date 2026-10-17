import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../data/site';
import { logEntries } from '../lib/content';

export async function GET(context: APIContext) {
  const l = await logEntries();
  const items = [
    ...l.map((x) => ({ title: `${x.data.kind}: ${x.data.text}`, description: x.data.text, pubDate: x.data.date, link: `/log#${x.id}` })),
  ].sort((a, b) => +b.pubDate - +a.pubDate);
  return rss({ title: SITE.name, description: SITE.description, site: context.site!, items });
}
