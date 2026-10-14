// Real book covers and page counts from Open Library (free, no key).
// An `isbn:` in the book's frontmatter pins the exact edition; otherwise it searches by title + author.
// A `cover:` in frontmatter always wins over this.
import { live, request } from './core';

export type CoverInfo = { cover: string | null; pages: number | null };
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
  const q = new URLSearchParams({ title: short(b.title), author: b.author, limit: '5', fields: 'cover_i,number_of_pages_median' });
  const r = await get(`https://openlibrary.org/search.json?${q}`);
  const hit = (r?.docs ?? []).find((d: any) => d.cover_i) ?? r?.docs?.[0];
  return {
    cover: hit?.cover_i ? `https://covers.openlibrary.org/b/id/${hit.cover_i}-L.jpg` : null,
    pages: hit?.number_of_pages_median ?? null,
  };
}

/** id → cover info, for every local book. Failures for one book don't affect the others. */
export const bookCovers = (books: Want[]) =>
  live<Record<string, CoverInfo>>('covers', async (get) => {
    const out: Record<string, CoverInfo> = {};
    await Promise.all(books.map(async (b) => { out[b.id] = await one(get, b).catch(() => ({ cover: null, pages: null })); }));
    return Object.values(out).some((x) => x.cover || x.pages) ? out : null;
  });
