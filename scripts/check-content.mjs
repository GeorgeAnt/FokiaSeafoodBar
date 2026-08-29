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
  for (const field of ['role', 'bio']) {
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

const walk = (groups, trail) => {
  for (const g of groups) {
    const path = [...trail, g.name];
    if (g.items) categoryCount++;
    for (const item of g.items ?? []) {
      itemCount++;
      if (!item.id) fail(`item "${item.name}" has no id`);
      else if (ids.has(item.id)) fail(`duplicate item id "${item.id}"`);
      else ids.add(item.id);

      if (!item.name?.trim()) fail(`item "${item.id}" has no name`);
      if (!('price' in item)) fail(`item "${item.id}" has no price field (use null if unpriced)`);
      else if (item.price !== null && (typeof item.price !== 'number' || !(item.price >= 0))) {
        fail(`item "${item.id}" has an invalid price: ${JSON.stringify(item.price)}`);
      } else if (item.price === null) {
        // Several unpriced wines share a producer name, so the label and grape
        // have to be included or the list cannot be acted on.
        const detail = item.wine
          ? ` (${[item.wine.label, item.wine.style, item.wine.grape].filter(Boolean).join(', ')})`
          : '';
        unpriced.push(`${path.join(' / ')} — ${item.name}${detail}`);
      }
    }
    if (g.subcategories) walk(g.subcategories, path);
  }
};
walk(food.categories, []);
walk(drinks.categories, []);
console.log(`  ${itemCount} items across ${categoryCount} sections, all ids unique`);

/* --- Placeholders still to be replaced ----------------------------------- */
const site = readFileSync(join(root, 'src/data/site.json'), 'utf8');
const placeholderCount = (site.match(/PLACEHOLDER/g) ?? []).length;
const placeholderTeam = team.members.filter((m) => m.placeholder).length;

console.log('\n--- still needed from the client ---');
console.log(`\nUnpriced items (${unpriced.length}):`);
for (const u of unpriced) console.log(`  · ${u}`);
console.log(`\nPlaceholders in site.json: ${placeholderCount} (address, hours, phone, domain, socials)`);
console.log(`Team entries still marked placeholder: ${placeholderTeam}/${team.members.length}`);

console.log(`\n${errors === 0 ? 'OK — no errors' : `${errors} error(s)`}`);
process.exit(errors === 0 ? 0 : 1);
