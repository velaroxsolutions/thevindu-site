import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../data/site';
import { notes, logEntries } from '../lib/content';

export async function GET(context: APIContext) {
  const [n, l] = await Promise.all([notes(), logEntries()]);
  const items = [
    ...n.map((x) => ({ title: x.data.title, description: x.data.dek, pubDate: x.data.date, link: `/notes/${x.id}/` })),
    ...l.map((x) => ({ title: `${x.data.kind}: ${x.data.text}`, description: x.data.text, pubDate: x.data.date, link: `/log#${x.id}` })),
  ].sort((a, b) => +b.pubDate - +a.pubDate);
  return rss({ title: SITE.name, description: SITE.description, site: context.site!, items });
}
