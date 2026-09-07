/**
 * robots.txt.
 *
 * An endpoint rather than a file in public/, because the sitemap line has to
 * carry an absolute URL and the domain is written exactly once in this project
 * — `site.seo.url`, which is also what `astro.config.mjs` hands to `Astro.site`.
 * The static copy this replaced still read `https://example.com/sitemap-index.xml`
 * long after everything else derived from the JSON, which is the failure mode
 * worth avoiding: a hard-coded domain in public/ has nothing pointing at it and
 * nothing checking it, so it goes stale in silence.
 *
 * `sitemap-index.xml` is the file @astrojs/sitemap actually emits; the
 * per-page `sitemap-0.xml` is referenced from inside it.
 */
import type { APIRoute } from 'astro';
import { indexable } from '../lib/indexable';

export const GET: APIRoute = ({ site }) => {
  /*
    A preview build disallows everything and advertises no sitemap — handing a
    crawler a list of preview URLs is the opposite of the intent. See
    lib/indexable.ts for why this is an env var rather than a hostname check,
    and why the `noindex` meta in Base.astro is needed as well as this.
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
 