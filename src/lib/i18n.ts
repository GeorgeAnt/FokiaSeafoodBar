/**
 * Bilingual chrome, bilingual content.
 *
 * Everything on the site is translated now, including the menu: nav, headings,
 * buttons, body copy, alt text, the legal block, team names/roles/bios, and
 * menu category/item names, descriptions, units, variants and wine fields. Keys
 * live in `src/i18n/{el,en}.json`, plus the content keys derived below from
 * locale-keyed JSON (`{ "el": "...", "en": "..." }` per field).
 *
 * The menu used to be the one exception — flat Greek strings in `menu-*.json`
 * that rendered identically in both locales, because the client's menu was
 * Greek as printed and no approved translation existed. The client has since
 * asked for an English menu, so `menu-food.json` / `menu-drinks.json` now carry
 * the same `{el, en}` shape team.json's fields do, and flow through the same
 * mechanism below. A unit or category name the client had written as a dual
 * literal before the site was bilingual ("6 τεμάχια | 6 pieces", "Νερό |
 * Water") is split across locales like any other field now, not carried over
 * as one string in both — the "|" was never a separator worth keeping, just
 * how the client wrote a bilingual label before there was a mechanism for one.
 * A few fields are still deliberately identical across both locales rather
 * than translated: a dish or drink name that is already English or a brand
 * ("Tuna tacos", "Nikka Whisky From The Barrel"), and wine producer/label
 * names, which are transliterated proper nouns rather than translations — the
 * same treatment team.json gives a person's name.
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
import { foodCategories, drinkCategories, type MenuGroup, type LocalizedText } from './menu';

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
    // Names are locale-keyed too: a Greek name written in Greek script would
    // otherwise sit untransliterated on the English page, the same problem
    // address.street solves in site.json.
    out[`team.${m.id}.name`] = m.name[locale];
    out[`team.${m.id}.role`] = m.role[locale];
    out[`team.${m.id}.bio`] = m.bio[locale];
  }

  for (const n of legalData.notices) out[`legal.${n.id}`] = n[locale];
  out['legal.manager.label'] = legalData.commercialManager[locale].label;
  out['legal.manager.name'] = legalData.commercialManager[locale].name;

  for (const img of galleryData.images) out[`gallery.${img.id}.alt`] = img.alt[locale];

  out['site.street'] = siteData.address.street[locale];
  out['site.city'] = siteData.address.city[locale];
  out['site.region'] = siteData.address.region[locale];
  out['site.countryName'] = siteData.address.countryName[locale];

  menuGroupKeys(locale, foodCategories, out);
  menuGroupKeys(locale, drinkCategories, out);

  return out;
}

/**
 * `variants`, `wine` and the `unit`/`volume` pair each combine several fields
 * into one rendered line in MenuItem.astro, so they are pre-joined here into a
 * single key per item rather than one key per field — the same reasoning as
 * `wineLine` used to follow as a plain function, just moved to where the other
 * locale joins already happen.
 */
function menuGroupKeys(locale: Locale, groups: MenuGroup[], out: Dict): void {
  for (const g of groups) {
    out[`menu.category.${g.id}.name`] = g.name[locale];
    if (g.unit) out[`menu.category.${g.id}.unit`] = g.unit[locale];

    for (const item of g.items ?? []) {
      out[`menu.item.${item.id}.name`] = item.name[locale];
      if (item.description) out[`menu.item.${item.id}.description`] = item.description[locale];

      const meta = [item.unit?.[locale], item.volume].filter(Boolean).join(' · ');
      if (meta) out[`menu.item.${item.id}.meta`] = meta;

      if (item.variants?.length) {
        out[`menu.item.${item.id}.variants`] = item.variants.map((v) => v[locale]).join(' / ');
      }

      if (item.wine) {
        const wineLine = ([item.wine.producer, item.wine.label, item.wine.style, item.wine.grape] as (
          | LocalizedText
          | undefined
        )[])
          .filter((v): v is LocalizedText => Boolean(v))
          .map((v) => v[locale])
          .join(' · ');
        if (wineLine) out[`menu.item.${item.id}.wineLine`] = wineLine;
      }
    }

    if (g.subcategories) menuGroupKeys(locale, g.subcategories, out);
  }
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
