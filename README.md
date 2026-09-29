# thevindu-site

My personal site. [Astro](https://astro.build) with the content kept as data, one set of design tokens, and hand-written motion. There's no UI framework.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # type-check .astro + content schemas
```

## Where things live

| You want to…                          | Edit                                   |
| ------------------------------------- | -------------------------------------- |
| Change email, domain, socials, nav    | `src/data/site.ts`                     |
| Update the "Now" block / chess rating | `src/data/now.ts`                      |
| Add a log entry (ticker + /log)       | `src/data/log.yaml`                    |
| Add a skill                           | `src/data/skills.yaml`                 |
| Edit the timeline / side projects     | `src/data/timeline.yaml`, `experiments.yaml` |
| Edit the résumé                       | `src/data/cv.ts`                       |
| Photos + hobbies on /about            | `src/data/about.ts` (images → `public/photos/`) |
| Aperis matcher dimensions & profiles  | `src/data/matcher.ts`                  |
| Write a case study                    | `src/content/projects/*.mdx`           |
| Write a note                          | `src/content/notes/*.md`               |
| Add a book / course / template        | `src/content/{books,courses,templates}/*.md` |

Every count, list, the ⌘K palette, the homepage "latent field", the RSS feed and the sitemap
are generated from those files, so nothing needs updating by hand.

Content is validated by the schemas in `src/content.config.ts`, so a typo in a field name fails the build instead of shipping.

### Placeholders to swap
- `SITE.email` and `SITE.url` in `src/data/site.ts`
- `public/resume.pdf` (the /cv page also prints cleanly to PDF)
- Course PDFs → `public/notes/…` and uncomment `pdf:` in each course file
- Template repo links → `href:` in each template file
- Screenshots: `shots:` in each project's frontmatter; photos in `src/data/about.ts`
- Book covers: optional `cover:` per book (otherwise a cover is generated from the title)
- `links:` on each project (currently `#`, shown as disabled)

## Structure

```
src/
  content/        markdown/MDX collections (projects, notes, books, courses, templates)
  data/           YAML + TS data (log, skills, timeline, now, cv, site config)
  components/     Rail, TopBar (+ mobile menu), Palette, Field, Matcher, Arch, …
  layouts/        Base.astro (head, SEO, theme, chrome)
  pages/          routes — /work/[slug], /notes/[slug], /library/…, /log, /cv, rss.xml
  scripts/        client-side TS, one module per behaviour
  styles/         tokens.css → base.css → components.css → pages.css
```

## Deploying on Vercel

Import the repo in Vercel and it detects Astro automatically; the build command is `npm run build` and the output is `dist`.
`vercel.json` permanently redirects the old `*.html` URLs to the new clean ones. Add your domain in
Vercel → Settings → Domains, then set `SITE.url` to match so canonical URLs, the sitemap and OG tags are right.
