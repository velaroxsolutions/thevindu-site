# thevindu-site

My personal site. [Astro](https://astro.build) with the content kept as data, one set of design tokens, and hand-written motion. There's no UI framework.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # type-check .astro + content schemas
npm run sync     # build with live data AND save it to src/data/snapshots (commit those)
npm run dev:offline    # no network — snapshots only
npm run dev:fixtures   # fake live data from tests/fixtures, to work on the UI
```

## Where things live

| You want to…                          | Edit                                   |
| ------------------------------------- | -------------------------------------- |
| Change email, domain, socials, nav    | `src/data/site.ts`                     |
| Usernames for GitHub, chess, Duolingo, Unsplash, Pexels, Notion, App Store | `src/data/profiles.ts` |
| Update the "Now" block / chess rating | `src/data/now.ts`                      |
| Add a log entry (ticker + /log)       | `src/data/log.yaml`                    |
| Add a skill                           | `src/data/skills.yaml`                 |
| Edit the timeline / side projects     | `src/data/timeline.yaml`, `experiments.yaml` |
| Edit the résumé (incl. certificates, awards) | `src/data/cv.ts`                |
| Add a completed course / certificate  | `src/data/courses.yaml`                |
| "This term" courses (About + homepage) | `src/data/term.ts`                     |
| Add a lesson learnt (with a `type` for the filter) | `src/content/lessons/*.md` |
| Research shelf                        | `src/data/research.ts`                 |
| Shipped / up-next project cards       | `src/data/ventures.yaml`               |
| "Also experienced with" chips          | `src/data/also.ts`                     |
| Photos (alt text, order)              | `src/assets/photos/` + `src/data/photos.ts` |
| Photos + hobbies on /about            | `src/data/about.ts` (images → `public/photos/`) |
| Aperis matcher dimensions & profiles  | `src/data/matcher.ts`                  |
| Write a case study                    | `src/content/projects/*.mdx`           |
| Add a book                            | `src/content/books/*.md` (or the Notion reading DB) |

Every count, list, the ⌘K palette, the homepage "latent field", the RSS feed and the sitemap
are generated from those files, so nothing needs updating by hand.

Content is validated by the schemas in `src/content.config.ts`, so a typo in a field name fails the build instead of shipping.

### Placeholders to swap
- `SITE.email` and `SITE.url` in `src/data/site.ts`
- `public/resume.pdf` (the /cv page also prints cleanly to PDF)
- Certificate links → `url:` in `src/data/courses.yaml`
- Anything marked `VERIFY` in the content (draft quotes, lessons, skill levels)
- Screenshots: `shots:` in each project's frontmatter; photos in `src/data/about.ts`
- Book covers: optional `cover:` per book (otherwise a cover is generated from the title)
- `links:` on each project (currently `#`, shown as disabled)

## Live data

At build time the site pulls from your accounts (`src/lib/live/`):

| Source | Shows up in | Needs |
| --- | --- | --- |
| GitHub | homepage heatmap + last commit, /work "In the open", palette, field | nothing (`GITHUB_TOKEN` for the heatmap) |
| App Store (iTunes lookup) | Aperis version/rating/screenshots, top bar chip, log entries | nothing |
| Lichess + Chess.com | homepage chess cell with rating sparkline, About | nothing |
| Duolingo | homepage streak cell, About | nothing (unofficial endpoint) |
| Unsplash | /photos, About photo strip | `UNSPLASH_ACCESS_KEY` |
| Pexels | /photos | photo IDs listed in `profiles.ts` (their API can't list a user's uploads) |
| Notion | Book + course summaries rendered as pages on this site (`/library/notes/…`), courses matched to their pages by title | `NOTION_TOKEN` + share "Course summaries", the reading database and each book summary with the integration |

Every source is optional and wrapped in a timeout. If one is down, the build uses the last
snapshot in `src/data/snapshots/`, or hides that block. It never fails the deploy. See
`.env.example`. `.github/workflows/rebuild.yml` triggers a daily Vercel rebuild so the
numbers stay fresh (it needs a `VERCEL_DEPLOY_HOOK` secret).

LinkedIn has no public API. Link projects there from `src/data/experiments.yaml` instead.

## Live refresh (Vercel function)

Pages are static, but `src/pages/api/stats.ts` runs as a Vercel function. It returns fresh
GitHub + chess stats, cached at the edge for an hour, and `src/scripts/livestats.ts` swaps them
into the page after load. The GitHub token stays on the server. Redirects for old URLs live in
`astro.config.mjs`.

## Structure

```
src/
  content/        markdown/MDX collections (projects, lessons, books)
  data/           YAML + TS data (log, skills, timeline, now, cv, site config)
  components/     Rail, TopBar (+ mobile menu), Palette, Field, Matcher, Arch, …
  layouts/        Base.astro (head, SEO, theme, chrome)
  pages/          routes — /work/[slug], /lessons, /library/…, /photos, /log, /cv, rss.xml
  scripts/        client-side TS, one module per behaviour
  styles/         tokens.css → base.css → components.css → pages.css
```

## Deploying on Vercel

Import the repo in Vercel and it detects Astro automatically; the build command is `npm run build` and the output is `dist`.
`vercel.json` permanently redirects the old `*.html` URLs to the new clean ones. Add your domain in
Vercel → Settings → Domains, then set `SITE.url` to match so canonical URLs, the sitemap and OG tags are right.
