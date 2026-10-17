// Fallback for books without a stored cover (see scripts/fetch-covers.mjs): look it up on Open Library at build.
// An `isbn:` in the book's frontmatter pins the exact edition; otherwise it searches by title + author.
// A `cover:` in frontmatter always wins over this.
import { live, request } from './core';

export type CoverInfo = { cover: string | null; pages: number | null; description?: string | null };
type Want = { id: string; title: string; author: string; isbn?: string };

const short = (t: string) => t.split(/[:(]/)[0].trim();

async function one(get: typeof request, b: Want): Promise<CoverInfo> {
  if (b.isbn) {
    const isbn = b.isbn.replace(/[^0-9X]/gi, '');
    const ed = await get(`https://openlibrary.org/isbn/${isbn}.json`).catch(() => null);
    return {
      cover: ed?.covers?.[0] > 0 ? `https://covers.openlibrary.org/b/id/${ed.covers[0]}-L.jpg` : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
      pages: ed?.number_of_pages ?? null,
    };
  }
  const q = new URLSearchParams({ title: short(b.title), author: b.author, limit: '5', fields: 'key,cover_i,number_of_pages_median' });
  const r = await get(`https://openlibrary.org/search.json?${q}`);
  const hit = (r?.docs ?? []).find((d: any) => d.cover_i) ?? r?.docs?.[0];
  const w = hit?.key ? await get(`https://openlibrary.org${hit.key}.json`).catch(() => null) : null;
  const d = typeof w?.description === 'string' ? w.description : w?.description?.value;
  return {
    cover: hit?.cover_i ? `https://covers.openlibrary.org/b/id/${hit.cover_i}-M.jpg` : null,
    pages: hit?.number_of_pages_median ?? null,
    description: d ? d.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim().slice(0, 300) : null,
  };
}

/** id → cover info, for every local book. Failures for one book don't affect the others. */
export const bookCovers = (books: Want[]) =>
  !books.length ? Promise.resolve(null) : live<Record<string, CoverInfo>>('covers', async (get) => {
    const out: Record<string, CoverInfo> = {};
    await Promise.all(books.map(async (b) => { out[b.id] = await one(get, b).catch(() => ({ cover: null, pages: null })); }));
    return Object.values(out).some((x) => x.cover || x.pages) ? out : null;
  });
