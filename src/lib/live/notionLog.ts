// The log, written from your phone: one row in a Notion database = one log entry.
//
// Setup (once): make a Notion database with these columns (names can vary a little):
//   Name     (title)    — the entry itself, one line           e.g. "Fixed the chat scroll bug"
//   Kind     (select)   — Shipped · Started · Learned · Broke · Stuck · Reading · Milestone
//   Date     (date)     — optional; empty = the day you added it
//   Project  (select)   — optional, e.g. Aperis
//   Link     (url)      — optional
//   Hide     (checkbox) — optional; tick to keep a row off the site
// Share it with the site's Notion integration and put its id in NOTION_LOG_DB.
import { live, token, env, request } from './core';

export type NotionLogEntry = { id: string; date: string; kind: string; text: string; project?: string; link?: string };

const H = () => ({ headers: { Authorization: `Bearer ${token('NOTION_TOKEN')}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' } });
const plain = (rt: any[] = []) => rt.map((t) => t.plain_text).join('').trim();
const byType = (P: Record<string, any>, type: string, re?: RegExp) =>
  Object.entries(P).find(([k, v]) => v?.type === type && (!re || re.test(k)))?.[1];
const KINDS = ['Shipped', 'Started', 'Learned', 'Broke', 'Stuck', 'Reading', 'Milestone'];
const normKind = (k: string) => KINDS.find((x) => x.toLowerCase() === k.trim().toLowerCase()) ?? (k.trim() || 'Note');

export const logDbId = () => (env('NOTION_LOG_DB') || '').replace(/-/g, '').match(/[0-9a-f]{32}/i)?.[0] ?? null;

/** Raw fetch, no caching — the /api/log function calls this so new rows show up within minutes. */
export async function loadNotionLog(get: typeof request): Promise<NotionLogEntry[] | null> {
  const db = logDbId();
  if (!db || !token('NOTION_TOKEN')) return null;
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const r = await get(`https://api.notion.com/v1/databases/${db}/query`, {
      method: 'POST', ...H(),
      body: JSON.stringify({ page_size: 100, start_cursor: cursor, sorts: [{ timestamp: 'created_time', direction: 'descending' }] }),
    });
    rows.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return rows
    .map((r) => {
      const P = r.properties || {};
      const hide = byType(P, 'checkbox', /hide|private|draft/i);
      const text = plain(byType(P, 'title')?.title);
      const kindP = byType(P, 'select', /kind|type|category/i) ?? byType(P, 'status');
      const projP = byType(P, 'select', /project/i) ?? byType(P, 'rich_text', /project/i);
      return {
        hidden: !!hide?.checkbox || !text,
        id: 'n-' + r.id.replace(/-/g, '').slice(0, 12),
        date: byType(P, 'date')?.date?.start ?? r.created_time,
        kind: normKind(kindP?.select?.name ?? kindP?.status?.name ?? ''),
        text,
        project: (projP?.select?.name ?? plain(projP?.rich_text)) || undefined,
        link: byType(P, 'url')?.url || undefined,
      };
    })
    .filter((e) => !e.hidden)
    .map(({ hidden, ...e }) => e);
}

export const notionLog = () => live<NotionLogEntry[]>('notion-log', loadNotionLog);
