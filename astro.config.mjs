// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// Deploy URL. Override with a SITE_URL env var (or repo variable in CI).
// Finalized in Phase 8 to the real lyria.<account>.workers.dev (the
// account subdomain is only known after the first deploy).
const SITE = process.env.SITE_URL || 'https://lyria.temlis.workers.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  compressHTML: true,
  integrations: [
    sitemap({
      // Keep error pages (401/404) out of the sitemap.
      filter: (page) => !/\/(401|404)\/?$/.test(page),
    }),
  ],
});
