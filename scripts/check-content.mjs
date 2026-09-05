/**
 * Content checks for the JSON data files. Run with `npm run check`.
 *
 * Catches the mistakes that are easy to make when editing content by hand and
 * that would otherwise only show up as a broken page:
 *
 *   - a UI string translated in one locale but not the other
 *   - a photo referenced from JSON that is not in src/assets/photos/
 *   - duplicate item ids
 *   - malformed prices
 *
 * It also prints the list of items the client still has not priced.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const el = read('src/i18n/el.json');
const en = read('src/i18n/en.json');
const food = read('src/data/menu-food.json');
const drinks = read('src/data/menu-drinks.json');
const team = read('src/data/team.json');
const gallery = read('src/data/gallery.json');
const legal = read('src/data/legal.json');

let errors = 0;
const fail = (msg) => {
  errors++;
  console.error(`  ERROR  ${msg}`);
};

/* --- UI string parity ---------------------------------------------------- */
console.log('\ni18n key parity');
const elKeys = Object.keys(el).filter((k) => k !== '$comment');
const enKeys = Object.keys(en).filter((k) => k !== '$comment');
for (const k of elKeys) if (!enKeys.includes(k)) fail(`en.json is missing "${k}"`);
for (const k of enKeys) if (!elKeys.includes(k)) fail(`el.json is missing "${k}"`);
for (const k of elKeys) {
  if (enKeys.includes(k) && !String(en[k]).trim()) fail(`en.json has an empty value for "${k}"`);
}
console.log(`  ${elKeys.length} keys in each locale`);

/* --- Locale-keyed content ------------------------------------------------ */
console.log('\nlocale-keyed content');
for (const m of team.members) {
  for (const field of ['name', 'role', 'bio']) {
    for (const loc of ['el', 'en']) {
      if (!m[field]?.[loc]?.trim()) fail(`team "${m.id}" is missing ${field}.${loc}`);
    }
  }
}
for (const n of legal.notices) {
  for (const loc of ['el', 'en']) if (!n[loc]?.trim()) fail(`legal notice "${n.id}" is missing ${loc}`);
}
for (const img of gallery.images) {
  for (const loc of ['el', 'en']) {
    if (!img.alt?.[loc]?.trim()) fail(`gallery image "${img.id}" is missing alt.${loc}`);
  }
}
console.log(`  ${team.members.length} team members, ${legal.notices.length} legal notices, ${gallery.images.length} gallery images`);

/* --- Photos referenced from JSON actually exist -------------------------- */
console.log('\nphoto references');
const photoDir = (folder) => join(root, 'src/assets/photos', folder);
const listed = (folder) =>
  existsSync(photoDir(folder)) ? readdirSync(photoDir(folder)) : [];

const galleryFiles = listed('gallery');
const teamFiles = listed('team');

for (const img of gallery.images) {
  if (!galleryFiles.includes(img.file)) fail(`gallery: "${img.file}" is not in src/assets/photos/gallery/`);
}
for (const m of team.members) {
  if (!teamFiles.includes(m.photo)) fail(`team: "${m.photo}" is not in src/assets/photos/team/`);
}
const unused = galleryFiles.filter((f) => !gallery.images.some((i) => i.file === f));
console.log(`  ${gallery.images.length}/${galleryFiles.length} gallery photos used`);
if (unused.length) console.log(`  note: not shown on the site — ${unused.join(', ')}`);

/* --- Menu integrity ------------------------------------------------------ */
console.log('\nmenu');
const ids = new Set();
const unpriced = [];
let itemCount = 0;
let categoryCount = 0;

// Menu text is locale-keyed ({ el, en }) the same way team.json's fields are —
// see lib/i18n.ts. A field is optional per-item, but when present it must have
// both locales, same rule the team/legal/gallery checks above already apply.
const localeParity = (label, obj) => {
  for (const loc of ['el', 'en']) if (!obj?.[loc]?.trim()) fail(`${label} is missing ${loc}`);
};

const walk = (groups, trail) => {
  for (const g of groups) {
    localeParity(`menu category "${g.id}" name`, g.name);
    if (g.unit) localeParity(`menu category "${g.id}" unit`, g.unit);
    const path = [...trail, g.name?.el ?? g.id];
    if (g.items) categoryCount++;
    for (const item of g.items ?? []) {
      itemCount++;
      if (!item.id) fail(`item with name "${item.name?.el}" has no id`);
      else if (ids.has(item.id)) fail(`duplicate item id "${item.id}"`);
      else ids.add(item.id);

      localeParity(`item "${item.id}" name`, item.name);
      if (item.description) localeParity(`item "${item.id}" description`, item.description);
      if (item.unit) localeParity(`item "${item.id}" unit`, item.unit);
      if (item.variants) {
        item.variants.forEach((v, i) => localeParity(`item "${item.id}" variant[${i}]`, v));
      }
      if (item.wine) {
        for (const field of ['producer', 'label', 'grape', 'style']) {
          if (item.wine[field]) localeParity(`item "${item.id}" wine.${field}`, item.wine[field]);
        }
      }

      if (!('price' in item)) fail(`item "${item.id}" has no price field (use null if unpriced)`);
      else if (item.price !== null && (typeof item.price !== 'number' || !(item.price >= 0))) {
        fail(`item "${item.id}" has an invalid price: ${JSON.stringify(item.price)}`);
      } else if (item.price === null) {
        // Several unpriced wines share a producer name, so the label and grape
        // have to be included or the list cannot be acted on. Greek only here —
        // this list is for the client.
        const wine = item.wine;
        const detail = wine
          ? ` (${[wine.label?.el, wine.style?.el, wine.grape?.el].filter(Boolean).join(', ')})`
          : '';
        unpriced.push(`${path.join(' / ')} — ${item.name?.el}${detail}`);
      }
    }
    if (g.subcategories) walk(g.subcategories, path);
  }
};
walk(food.categories, []);
walk(drinks.categories, []);
console.log(`  ${itemCount} items across ${categoryCount} sections, all ids unique`);

/* --- Placeholders still to be replaced ----------------------------------- */
const site = read('src/data/site.json');

/** Walks site.json and names the fields that are still unset or placeholder. */
function outstandingSiteFields(node, trail = []) {
  const found = [];
  let placeholderNote = null;

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      if (typeof value === 'string' && value.includes('PLACEHOLDER')) {
        placeholderNote = [...trail, key].join('.');
      }
      continue;
    }
    const path = [...trail, key].join('.');
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      found.push(...outstandingSiteFields(value, [...trail, key]));
    } else if (typeof value === 'string' && value.includes('PLACEHOLDER')) {
      found.push(`${path} — still says PLACEHOLDER`);
    } else if (value === null) {
      found.push(`${path} — not set`);
    } else if (path === 'seo.url' && value.includes('example.com')) {
      found.push(`${path} — still the example domain`);
    }
  }

  /*
    A `$comment` saying PLACEHOLDER only counts when nothing beneath it was
    caught by a rule of its own.

    That is exactly the case the opening hours hit: plausible times that no rule
    could tell were invented, flagged only in prose — and because this walk used
    to skip every `$`-prefixed key outright, `npm run check` never mentioned them
    once, while README had already moved them to "confirmed and in place". Where
    the data itself trips a rule (geo's nulls, seo's example domain) the note is
    a duplicate, and the top-level one just describes the convention.
  */
  if (placeholderNote && found.length === 0) {
    found.push(`${placeholderNote} — note says PLACEHOLDER and no field under it is flagged`);
  }

  return found;
}

const outstanding = outstandingSiteFields(site);
const placeholderTeam = team.members.filter((m) => m.placeholder).length;

console.log('\n--- still needed from the client ---');
console.log(`\nUnpriced items (${unpriced.length}):`);
for (const u of unpriced) console.log(`  · ${u}`);

console.log(`\nsite.json (${outstanding.length} outstanding):`);
if (outstanding.length === 0) console.log('  · nothing outstanding');
for (const o of outstanding) console.log(`  · ${o}`);

console.log(`\nTeam entries still marked placeholder: ${placeholderTeam}/${team.members.length}`);

console.log(`\n${errors === 0 ? 'OK — no errors' : `${errors} error(s)`}`);
process.exit(errors === 0 ? 0 : 1);
