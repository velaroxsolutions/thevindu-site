// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { SITE } from './src/data/site.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  // Pages are static; only /api/stats runs as a function (it opts out of prerendering).
  adapter: vercel(),
  integrations: [mdx(), sitemap({ filter: (p) => !p.includes('/api/') })],
  // Old URLs from the hand-built site and earlier versions.
  redirects: {
    '/index.html': '/',
    '/work.html': '/work',
    '/work-aperis.html': '/work/aperis',
    '/about.html': '/about',
    '/library.html': '/library',
    '/library-books.html': '/library/books',
    '/library-courses.html': '/library/courses',
    '/library-templates.html': '/library',
    '/cv.html': '/cv',
    '/notes': '/lessons',
    '/library/templates': '/library',
    '/notes/the-contrastive-gap': '/lessons',

  },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Notion summaries can include images from anywhere; they're downloaded and optimised at build.
  image: { remotePatterns: [{ protocol: 'https' }] },
});
