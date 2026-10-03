// Render a Notion page as HTML at build time, so summaries live on this site
// in its own typography instead of an iframe. Needs NOTION_TOKEN and the page
// shared with the integration. Images are re-hosted (Notion file URLs expire).
import { getImage } from 'astro:assets';
import { live, token } from './core';
import { PROFILES } from '../../data/profiles';

type Block = any;
const H = () => ({ headers: { Authorization: `Bearer ${token('NOTION_TOKEN')}`, 'Notion-Version': '2022-06-28' } });
const esc = (s: string) => s.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]!);
export const normId = (id: string) => id.replace(/-/g, '').slice(-32);

/** Raw block tree (cached per build, and snapshotted by `npm run sync`). */
export const notionTree = (id: string) =>
  live<{ title: string; blocks: Block[]; url: string }>(`notion-page-${normId(id)}`, async (get) => {
    if (!token('NOTION_TOKEN')) return null;
    const page = await get(`https://api.notion.com/v1/pages/${id}`, H());
    const titleProp: any = Object.values(page.properties || {}).find((p: any) => p.type === 'title');
    const title = (titleProp?.title || []).map((t: any) => t.plain_text).join('');
    const children = async (bid: string, depth = 0): Promise<Block[]> => {
      const out: Block[] = [];
      let cursor: string | undefined;
      do {
        const r = await get(`https://api.notion.com/v1/blocks/${bid}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, H());
        for (const b of r.results) {
          if (b.has_children && depth < 3 && b.type !== 'child_page' && b.type !== 'child_database') b.children = await children(b.id, depth + 1);
          out.push(b);
        }
        cursor = r.has_more ? r.next_cursor : undefined;
      } while (cursor);
      return out;
    };
    return { title, blocks: await children(id), url: page.public_url || `${PROFILES.notion.site}/${normId(id)}` };
  });

function rich(rt: any[] = []): string {
  return rt.map((t) => {
    let s = esc(t.plain_text || '').replace(/\n/g, '<br>');
    const a = t.annotations || {};
    if (a.code) s = `<code>${s}</code>`;
    if (a.bold) s = `<strong>${s}</strong>`;
    if (a.italic) s = `<em>${s}</em>`;
    if (a.strikethrough) s = `<s>${s}</s>`;
    if (a.underline) s = `<u>${s}</u>`;
    const href = t.href || t.text?.link?.url;
    if (href) s = `<a href="${esc(href)}" target="_blank" rel="noopener">${s}</a>`;
    return s;
  }).join('');
}

async function image(url: string, alt: string) {
  try {
    const img = await getImage({ src: url, inferSize: true, width: 1200, format: 'webp', quality: 75 });
    return `<figure class="n-img"><img src="${img.src}" alt="${esc(alt)}" loading="lazy" decoding="async" width="${img.attributes.width ?? ''}" height="${img.attributes.height ?? ''}">${alt ? `<figcaption>${esc(alt)}</figcaption>` : ''}</figure>`;
  } catch {
    return ''; // expired or unreachable — skip rather than ship a broken image
  }
}

async function render(blocks: Block[]): Promise<string> {
  let html = '', list: 'ul' | 'ol' | null = null;
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const b of blocks) {
    const v = b[b.type] || {};
    const kids = b.children ? await render(b.children) : '';
    const t = rich(v.rich_text);
    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      const want = b.type === 'bulleted_list_item' ? 'ul' : 'ol';
      if (list !== want) { close(); html += `<${want}>`; list = want; }
      html += `<li>${t}${kids}</li>`;
      continue;
    }
    close();
    switch (b.type) {
      case 'paragraph': html += t ? `<p>${t}</p>${kids}` : ''; break;
      case 'heading_1': html += `<h2>${t}</h2>${kids}`; break;
      case 'heading_2': html += `<h3>${t}</h3>${kids}`; break;
      case 'heading_3': html += `<h4>${t}</h4>${kids}`; break;
      case 'to_do': html += `<p class="n-todo${v.checked ? ' done' : ''}"><span aria-hidden="true">${v.checked ? '☑' : '☐'}</span> ${t}</p>`; break;
      case 'toggle': html += `<details class="n-toggle"><summary>${t}</summary>${kids}</details>`; break;
      case 'quote': html += `<blockquote>${t}${kids}</blockquote>`; break;
      case 'callout': html += `<aside class="n-callout">${v.icon?.emoji ? `<span>${v.icon.emoji}</span>` : ''}<div>${t}${kids}</div></aside>`; break;
      case 'code': html += `<pre><code>${esc((v.rich_text || []).map((x: any) => x.plain_text).join(''))}</code></pre>`; break;
      case 'equation': html += `<pre class="n-eq"><code>${esc(v.expression || '')}</code></pre>`; break;
      case 'divider': html += '<hr>'; break;
      case 'image': html += await image(v.type === 'external' ? v.external.url : v.file?.url, (v.caption || []).map((x: any) => x.plain_text).join('')); break;
      case 'bookmark': case 'link_preview': case 'embed': {
        const u = v.url; if (u) html += `<p class="n-link"><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//, ''))} ↗</a></p>`; break;
      }
      case 'video': {
        const u = v.type === 'external' ? v.external.url : '';
        const yt = u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
        if (yt) html += `<div class="n-video"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Video" loading="lazy" allowfullscreen></iframe></div>`;
        else if (u) html += `<p class="n-link"><a href="${esc(u)}" target="_blank" rel="noopener">Video ↗</a></p>`;
        break;
      }
      case 'table': {
        const rows = (b.children || []).map((r: any, i: number) => `<tr>${(r.table_row?.cells || []).map((c: any) => (i === 0 && v.has_column_header ? `<th>${rich(c)}</th>` : `<td>${rich(c)}</td>`)).join('')}</tr>`).join('');
        html += `<div class="n-table"><table>${rows}</table></div>`; break;
      }
      case 'column_list': html += `<div class="n-cols">${kids}</div>`; break;
      case 'column': html += `<div>${kids}</div>`; break;
      case 'child_page': html += `<p class="n-link"><a href="${PROFILES.notion.site}/${normId(b.id)}" target="_blank" rel="noopener">${esc(v.title || 'Sub-page')} ↗</a></p>`; break;
      default: break;
    }
  }
  close();
  return html;
}

/** Title + HTML for a Notion page, or null when it can't be fetched. */
export async function notionHTML(id: string) {
  const tree = await notionTree(id);
  if (!tree || !tree.blocks.length) return null;
  return { title: tree.title, url: tree.url, html: await render(tree.blocks) };
}

/** Map course titles → Notion page ids from the "Course summaries" index page. */
export const notionCourseIndex = () =>
  live<{ title: string; id: string }[]>('notion-course-index', async (get) => {
    if (!token('NOTION_TOKEN')) return null;
    const out: { title: string; id: string }[] = [];
    const walk = async (bid: string, depth: number) => {
      let cursor: string | undefined;
      do {
        const r = await get(`https://api.notion.com/v1/blocks/${bid}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, H());
        for (const b of r.results) {
          if (b.type === 'child_page') out.push({ title: b.child_page.title, id: normId(b.id) });
          else if (b.type === 'link_to_page' && b.link_to_page?.page_id) out.push({ title: '', id: normId(b.link_to_page.page_id) });
          else if (b.has_children && depth < 2 && !['child_database'].includes(b.type)) await walk(b.id, depth + 1);
        }
        cursor = r.has_more ? r.next_cursor : undefined;
      } while (cursor);
    };
    await walk(PROFILES.notion.courses.id, 0);
    // link_to_page blocks don't carry a title — look those up
    for (const e of out.filter((x) => !x.title)) {
      try {
        const p = await get(`https://api.notion.com/v1/pages/${e.id}`, H());
        const tp: any = Object.values(p.properties || {}).find((x: any) => x.type === 'title');
        e.title = (tp?.title || []).map((t: any) => t.plain_text).join('');
      } catch {}
    }
    return out.filter((x) => x.title);
  });
