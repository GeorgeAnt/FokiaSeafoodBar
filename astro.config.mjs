// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  // Drives canonical URLs, Open Graph tags and sitemap.xml.
  // PLACEHOLDER until the client confirms the production domain — see src/data/site.json.
  site: site.seo.url,

  integrations: [sitemap()],

  build: {
    // One stylesheet rather than many small ones; the whole site is a single page.
    inlineStylesheets: 'always',
  },

  // Note: `image.responsiveStyles` is deliberately left off. Every image here is
  // sized by the stylesheet, and Astro's injected `height: auto` only competes
  // with those rules.
});
