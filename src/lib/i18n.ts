/**
 * Bilingual chrome, Greek content.
 *
 * Two tiers, and the distinction matters:
 *
 *   Tier 1 — translated. Everything that is site chrome: nav, headings, buttons,
 *   body copy, alt text, the legal block, team roles and bios. Keys live in
 *   `src/i18n/{el,en}.json`, plus the content keys derived below.
 *
 *   Tier 2 — never translated. The menu. Dish names, descriptions and category
 *   names are flat Greek strings in `menu-*.json` and render identically in both
 *   locales, so they never pass through here at all.
 *
 * Greek is the default and is what the server renders. The language switcher is a
 * client-side swap over `data-i18n*` attributes, so the page is already correct
 * before any JS runs.
 */
import elStrings from '../i18n/el.json';
import enStrings from '../i18n/en.json';
import teamData from '../data/team.json';
import legalData from '../data/legal.json';
import galleryData from '../data/gallery.json';
import siteData from '../data/site.json';

export const locales = ['el', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'el';

type Dict = Record<string, string>;

/** `$comment` keys document the JSON for whoever edits it; they are not strings. */
function withoutComments(source: Record<string, unknown>): Dict {
  return Object.fromEntries(
    Object.entries(source).filter(([k, v]) => k !== '$comment' && typeof v === 'string')
  ) as Dict;
}

/**
 * Locale-keyed *content* (as opposed to UI strings) is flattened into the same
 * dictionary, so the switcher has exactly one mechanism to drive rather than one
 * per section.
 */
function contentKeys(locale: Locale): Dict {
  const out: Dict = {};

  for (const m of teamData.members) {
    out[`team.${m.id}.role`] = m.role[locale];
    out[`team.${m.id}.bio`] = m.bio[locale];
  }

  for (const n of legalData.notices) out[`legal.${n.id}`] = n[locale];
  out['legal.manager.label'] = legalData.commercialManager[locale].label;
  out['legal.manager.name'] = legalData.commercialManager[locale].name;

  for (const img of galleryData.images) out[`gallery.${img.id}.alt`] = img.alt[locale];

  out['site.countryName'] = siteData.address.countryName[locale];

  return out;
}

export const dictionaries: Record<Locale, Dict> = {
  el: { ...withoutComments(elStrings), ...contentKeys('el') },
  en: { ...withoutComments(enStrings), ...contentKeys('en') },
};

/**
 * Look up a string. Missing keys return the key itself rather than throwing or
 * rendering empty, so a typo is visible on the page instead of silently blank.
 */
export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let value = dictionaries[locale][key] ?? dictionaries[defaultLocale][key] ?? key;
  if (vars) {
    for (const [name, v] of Object.entries(vars)) value = value.replaceAll(`{${name}}`, String(v));
  }
  return value;
}

/** Keys present in one locale but not the other — surfaced by `npm run check`. */
export function missingKeys(): { locale: Locale; keys: string[] }[] {
  const all = new Set(locales.flatMap((l) => Object.keys(dictionaries[l])));
  return locales.map((locale) => ({
    locale,
    keys: [...all].filter((k) => !(k in dictionaries[locale])),
  }));
}
