// Downloads each book's cover once, shrinks it, and stores it in the repo:
//   public/covers/<book-id>.webp   – the image (≈20 KB, served from the site itself)
//   src/data/covers.json           – page count, a short description, the cover's main colour
// Runs in GitHub Actions when a book is added (.github/workflows/covers.yml), or locally:
//   node scripts/fetch-covers.mjs            only books that don't have a cover yet
//   node scripts/fetch-covers.mjs --force    redo all of them
// Source: Open Library (free, no key). `isbn:` in a book's frontmatter pins the edition.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BOOKS = 'src/content/books', OUT = 'public/covers', DATA = 'src/data/covers.json';
const force = process.argv.includes('--force');
const data = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : {};
fs.mkdirSync(OUT, { recursive: true });

const field = (src, k) => src.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1];
const get = async (url, as = 'json') => {
  const r = await fetch(url, { headers: { 'User-Agent': 'thevindu-site covers (github.com/velaroxsolutions/thevindu-site)' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return as === 'json' ? r.json() : Buffer.from(await r.arrayBuffer());
};
// Open Library descriptions can run long or carry source notes; keep two sentences.
const tidy = (d) => {
  const s = (typeof d === 'string' ? d : d?.value ?? '').replace(/\r/g, '').split(/\n\s*\n|-{3,}|\(\[source\]/)[0].replace(/\s+/g, ' ').trim();
  const two = s.match(/^(.+?[.!?])\s+(.+?[.!?])(\s|$)/);
  const out = two ? `${two[1]} ${two[2]}` : s;
  return out.length > 320 ? out.slice(0, 317).replace(/\s\S*$/, '') + '…' : out || null;
};

for (const file of fs.readdirSync(BOOKS).filter((f) => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const src = fs.readFileSync(path.join(BOOKS, file), 'utf8');
  const title = field(src, 'title'), author = field(src, 'author'), isbn = field(src, 'isbn')?.replace(/[^0-9X]/gi, '');
  if (!title) continue;
  if (!force && data[id]?.file && fs.existsSync(path.join('public', data[id].file))) continue;
  try {
    let coverId = null, pages = null, work = null;
    if (isbn) {
      const ed = await get(`https://openlibrary.org/isbn/${isbn}.json`);
      coverId = ed.covers?.find((c) => c > 0) ?? null; pages = ed.number_of_pages ?? null; work = ed.works?.[0]?.key ?? null;
    } else {
      const q = new URLSearchParams({ title: title.split(/[:(]/)[0].trim(), author: author ?? '', limit: '5', fields: 'key,cover_i,number_of_pages_median' });
      const r = await get(`https://openlibrary.org/search.json?${q}`);
      const hit = r.docs?.find((d) => d.cover_i) ?? r.docs?.[0];
      coverId = hit?.cover_i ?? null; pages = hit?.number_of_pages_median ?? null; work = hit?.key ?? null;
    }
    const w = work ? await get(`https://openlibrary.org${work}.json`).catch(() => null) : null;
    const entry = { pages, description: tidy(w?.description), file: null, color: null, source: work ? `https://openlibrary.org${work}` : null };
    if (coverId) {
      const img = sharp(await get(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`, 'buffer')).resize({ width: 360, withoutEnlargement: true });
      await img.clone().webp({ quality: 78 }).toFile(path.join(OUT, `${id}.webp`));
      const { dominant } = await img.clone().stats();
      entry.file = `/covers/${id}.webp`;
      entry.color = `rgb(${dominant.r},${dominant.g},${dominant.b})`;
    }
    data[id] = entry;
    console.log(`✓ ${id}${entry.file ? '' : ' (no cover found)'}`);
  } catch (e) {
    console.warn(`✗ ${id}: ${e.message}`);
  }
}
fs.writeFileSync(DATA, JSON.stringify(Object.fromEntries(Object.entries(data).sort()), null, 1) + '\n');
