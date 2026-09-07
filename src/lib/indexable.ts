/**
 * Whether this build may be indexed by search engines.
 *
 * An env var rather than a hostname check: this is a static build, so there is
 * no request to read a Host header from — only whatever runs the build knows
 * which deployment it is producing. Set NOINDEX=1 in the preview environment;
 * production sets nothing and is indexable, which is the safer default to get
 * wrong.
 *
 * BOTH mechanisms that follow are needed. robots.txt stops the crawl; the
 * noindex meta stops a URL reached anyway from being listed, which robots.txt
 * alone does not — a disallowed URL can still appear on inbound links.
 */
export const indexable = import.meta.env.NOINDEX !== '1';
