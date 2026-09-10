/**
 * Bilingual chrome and bilingual content.
 *
 * Everything is translated, the menu included: keys live in
 * src/i18n/{el,en}.json, plus the content keys derived below from locale-keyed
 * JSON ({ "el": "…", "en": "…" } per field) in team.json, gallery.json,
 * menu-food.json, menu-drinks.json and privacy.json.
 *
 * Some values are deliberately identical in both locales rather than
 * translated: a dish or brand name that is already English ("Tuna tacos"), and
 * wine producer/label names, which are transliterated proper nouns — the same
 * treatment team.json gives a person's name.
 *
 * Greek is the default and is what the server renders. The switcher is a
 * client-side swap over data-i18n* attributes, so the page is correct before
 * any JS runs.
 */
import elStrings from '../i18n/el.json';
import enStrings from '../i18n/en.json';
import teamData from '../data/team.json';
import legalData from '../data/legal.json';
import galleryData from '../data/gallery.json';
import siteData from '../data/site.json';
import { foodCategories, drinkCategories, type MenuGroup, type LocalizedText } from './menu';
import { privacy } from './privacy';

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
 * Locale-keyed CONTENT is flattened into the same dictionary as the UI strings,
 * so the switcher has one mechanism to drive rather than one per section.
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

  out['privacy.controller.heading'] = privacy.controller.heading[locale];
  out['privacy.controller.intro'] = privacy.controller.intro[locale];
  out['privacy.controller.name'] = privacy.controller.name[locale];
  // By position: a paragraph is privacy.<id>.<i>, a list item privacy.<id>.<i>.<j>,
  // so reordering blocks in privacy.json renumbers its keys along with it.
  for (const s of privacy.sections) {
    out[`privacy.${s.id}.heading`] = s.heading[locale];
    s.body.forEach((block, i) => {
      if ('list' in block) block.list.forEach((item, j) => (out[`privacy.${s.id}.${i}.${j}`] = item[locale]));
      else out[`privacy.${s.id}.${i}`] = block[locale];
    });
  }

  out['site.street'] = siteData.address.street[locale];
  out['site.city'] = siteData.address.city[locale];
  out['site.region'] = siteData.address.region[locale];
  out['site.countryName'] = siteData.address.countryName[locale];

  menuGroupKeys(locale, foodCategories, out);
  menuGroupKeys(locale, drinkCategories, out);

  return out;
}

/**
 * variants, wine and the unit/volume pair each combine several fields into one
 * rendered line in MenuItem.astro, so they are pre-joined here into a single
 * key per item rather than one key per field.
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
