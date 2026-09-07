/**
 * Whether this build may be indexed by search engines.
 *
 * The site is deployed to a preview host (a *.pages.dev subdomain) as well as
 * to the real domain, and both serve byte-identical HTML — same canonical, same
 * sitemap, same everything. That is fine as far as it goes: a canonical naming
 * fokiaseafoodbar.gr is exactly what tells Google which copy is real. But a
 * canonical is a *hint*, and a preview URL that gets linked from anywhere can
 * still be crawled and indexed on its own, which puts a second copy of the
 * restaurant in the results under a URL nobody should be handing out.
 *
 * So it is an env var rather than a hostname check: this is a static build, so
 * there is no request to read a Host header from — the only thing that knows
 * which deployment is being produced is whatever is running the build.
 *
 * Set `NOINDEX=1` in the preview environment's build settings. Production sets
 * nothing and is indexable, which is the safer default of the two to get wrong:
 * a preview that leaks is a nuisance, a production site nobody can find is the
 * whole business.
 *
 * Two mechanisms follow from it and both are needed. robots.txt stops the
 * crawl; the `noindex` meta stops a URL that was reached anyway from being
 * listed, which robots.txt alone does not — a disallowed URL can still appear
 * in results on the strength of inbound links, with no snippet.
 */
export const indexable = import.meta.env.NOINDEX !== '1';
