import { live, token } from './core';
import { PROFILES } from '../../data/profiles';

// Official Notion API. Create an internal integration, copy its secret into
// NOTION_TOKEN, then on each page (Course summaries, the reading database)
// use "… → Connections → Add" to share it with the integration.
const H = () => ({ headers: { Authorization: `Bearer ${token('NOTION_TOKEN')}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' } });
const plain = (rt: any[] = []) => rt.map((t) => t.plain_text).join('').trim();
const pub = (id: string, title = '') =>
  `${PROFILES.notion.site}/${title.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}${title ? '-' : ''}${id.replace(/-/g, '')}`;

/** Read any property as text, whatever its Notion type. */
function prop(p: any): string {
  if (!p) return '';
  switch (p.type) {
    case 'title': return plain(p.title);
    case 'rich_text': return plain(p.rich_text);
    case 'select': return p.select?.name ?? '';
    case 'status': return p.status?.name ?? '';
    case 'multi_select': return p.multi_select.map((s: any) => s.name).join(', ');
    case 'number': return p.number == null ? '' : String(p.number);
    case 'date': return p.date?.start ?? '';
    case 'people': return p.people.map((x: any) => x.name).join(', ');
    case 'url': return p.url ?? '';
    case 'checkbox': return p.checkbox ? 'yes' : '';
    case 'formula': return String(p.formula?.[p.formula?.type] ?? '');
    default: return '';
  }
}
/** Find a property by fuzzy name, e.g. find(props, /author|writer/). */
const find = (props: Record<string, any>, re: RegExp) => Object.entries(props).find(([k]) => re.test(k))?.[1];

async function queryAll(get: any, db: string) {
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const r = await get(`https://api.notion.com/v1/databases/${db}/query`, { method: 'POST', ...H(), body: JSON.stringify({ page_size: 100, start_cursor: cursor }) });
    rows.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return rows;
}

export type NotionBook = { title: string; author: string; status: string; rating: string; take: string; tags: string[]; cover: string | null; url: string; date: string };
export type NotionCourse = { title: string; url: string; icon: string | null; blurb: string; updated: string };

export const notionBooks = () =>
  live<NotionBook[]>('notion-books', async (get) => {
    if (!token('NOTION_TOKEN')) return null;
    const rows = await queryAll(get, PROFILES.notion.reading.id);
    return rows.map((r) => {
      const P = r.properties || {};
      const titleProp = Object.values(P).find((p: any) => p.type === 'title');
      const title = prop(titleProp);
      return {
        title,
        author: prop(find(P, /author|writer|by/i)),
        status: prop(find(P, /status|verdict|state|progress/i)),
        rating: prop(find(P, /rating|score|stars/i)),
        take: prop(find(P, /take|learn|lesson|note|summary|key|insight/i)),
        tags: prop(find(P, /tag|genre|topic|categor/i)).split(', ').filter(Boolean),
        cover: r.cover?.external?.url ?? r.cover?.file?.url ?? null,
        url: r.public_url || pub(r.id, title),
        date: prop(find(P, /finish|date|read on|completed/i)) || r.last_edited_time,
      };
    }).filter((b) => b.title);
  });

export const notionCourses = () =>
  live<NotionCourse[]>('notion-courses', async (get) => {
    if (!token('NOTION_TOKEN')) return null;
    const root = PROFILES.notion.courses.id;
    const out: NotionCourse[] = [];
    let cursor: string | undefined;
    do {
      const r = await get(`https://api.notion.com/v1/blocks/${root}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, H());
      for (const b of r.results) {
        if (b.type === 'child_page') {
          out.push({ title: b.child_page.title, url: pub(b.id, b.child_page.title), icon: null, blurb: '', updated: b.last_edited_time });
        } else if (b.type === 'child_database') {
          const rows = await queryAll(get, b.id);
          rows.forEach((row) => {
            const P = row.properties || {};
            const title = prop(Object.values(P).find((p: any) => p.type === 'title'));
            out.push({
              title, url: row.public_url || pub(row.id, title), icon: row.icon?.emoji ?? null,
              blurb: prop(find(P, /desc|summary|topic|about|blurb/i)), updated: row.last_edited_time,
            });
          });
        }
      }
      cursor = r.has_more ? r.next_cursor : undefined;
    } while (cursor);
    return out.filter((c) => c.title);
  });
