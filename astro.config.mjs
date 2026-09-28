// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/data/site.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
