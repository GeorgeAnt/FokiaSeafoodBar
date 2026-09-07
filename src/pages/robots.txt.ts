/**
 * robots.txt as an endpoint, not a file in public/, because the sitemap line
 * needs an absolute URL and the domain is written exactly once in this project
 * (site.seo.url, which astro.config.mjs also hands to Astro.site). The static
 * copy this replaced still said https://example.com long after everything else
 * derived from the JSON: nothing points at a file in public/ and nothing checks
 * it, so it goes stale in silence.
 *
 * sitemap-index.xml is what @astrojs/sitemap actually emits.
 */
import type { APIRoute } from 'astro';
import { indexable } from '../lib/indexable';

export const GET: APIRoute = ({ site }) => {
  /*
    A preview build disallows everything and advertises no sitemap. See
    lib/indexable.ts for why this is an env var, and why the noindex meta in
    Base.astro is needed as well as this.
  */
  if (!indexable) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const sitemap = new URL('/sitemap-index.xml', site).toString();

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
 