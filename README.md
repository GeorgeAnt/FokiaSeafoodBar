# fokia — seafood bar

A single-page marketing site for the restaurant. Built with [Astro](https://astro.build),
which ships **zero JavaScript frameworks** — the whole page loads about 29 KB of
HTML/CSS (gzipped) plus images.

Greek is the default language. The site chrome switches to English; **the menu
itself always stays in Greek**, by design (see [Languages](#languages)).

---

## Running it

You need [Node.js](https://nodejs.org) 22.12 or newer.

```sh
npm install       # once
npm run dev       # http://localhost:4321 — live reload
npm run build     # production build into dist/
npm run preview   # serve the built dist/ locally
npm run check     # validate the content files (see below)
```

Deploy by uploading `dist/` to any static host — Netlify, Vercel, Cloudflare
Pages, GitHub Pages, or plain nginx. There is no server and no database.

---

## Editing content — no code required

Everything a non-developer needs to change lives in **`src/data/`** and
**`src/i18n/`** as plain JSON. Edit the file, save, run `npm run build`, upload
`dist/`. Nothing under `src/components/` needs to be touched.

> Run `npm run check` before building. It catches the mistakes that are easy to
> make by hand — a missing translation, a photo filename that does not exist, a
> duplicate id — and prints the list of items still without a price.

### The menu — `src/data/menu-food.json`, `src/data/menu-drinks.json`

Both files use the same shape. A minimal item needs only three fields:

```json
{
  "id": "salata-surimi",
  "name": "Σαλάτα surimi",
  "price": 9
}
```

`id` must be unique across both files — it is only used internally, so any short
lowercase name works. `name` and `description` are written in Greek exactly as
they appear on the printed menu; they are **never translated**.

Optional fields, each safe to leave out:

| Field | What it does | Example |
|---|---|---|
| `description` | A line under the name | `"Λάχανο, καρότο, τηγανητό surimi"` |
| `price` | A number, or `null` if not priced yet | `9`, `2.5`, `null` |
| `unit` | Portion size | `"2 τεμάχια"` |
| `volume` | For drinks | `"330 ml"` |
| `variants` | One price, several choices | `["Σολομός", "Τόνος", "Λαβράκι"]` |
| `wine` | Renders on its own italic line | `{ "producer": "…", "label": "…", "grape": "…", "style": "…" }` |
| `tags` | Small chips beside the item | `["spicy"]` |

**Prices.** Write them as numbers with a **dot**, not a comma — `2.5`, not `2,5`.
The site formats them the Greek way when it renders: `2.5` becomes `2,50 €` and
`9` becomes `9 €`.

**Items with no price yet.** Use `"price": null`. The item still appears on the
menu with an em dash where the price goes. Never delete an item just because it
is unpriced, and never write `"price": "??"`.

**Adding a category** — add an object to `categories`:

```json
{
  "id": "nea-katigoria",
  "name": "Νέα Κατηγορία",
  "unit": "6 τεμάχια | 6 pieces",
  "items": [ … ]
}
```

`unit` at the category level applies to every item in it (this is how Maki Rolls
and Inside-outs work). Categories appear in the order they are listed, and the
"jump to" chips update automatically. `Κρασί` additionally uses `subcategories`
(Ποτήρι / Φιάλη); any category can do the same.

### The team — `src/data/team.json`

Four members currently; the layout is designed to hold from four to six. Order in
the file is the order on the page. `name` is a single string (never translated);
`role` and `bio` have a Greek and an English version:

```json
{
  "id": "chef-john",
  "name": "Chef John",
  "photo": "chef-john.jpg",
  "placeholder": true,
  "role": { "el": "Εκτελεστικός Σεφ", "en": "Executive Chef" },
  "bio":  { "el": "…", "en": "…" }
}
```

`photo` is a filename inside `src/assets/photos/team/`. Remove the
`"placeholder": true` line once the real name and bio are in — it is only there so
`npm run check` can report what is still outstanding.

### Photos — `src/data/gallery.json`

```json
{
  "id": "interior",
  "file": "dsc-8248.jpg",
  "alt": { "el": "Ο εσωτερικός χώρος…", "en": "The dining room…" }
}
```

`file` must exist in `src/assets/photos/gallery/`. `alt` describes the picture for
screen readers and search engines — it is required in both languages.

To add new photos, drop the originals into the source folder and run
`npm run photos` (see [Images](#images)).

### Restaurant details — `src/data/site.json`

Name, phone, address, opening hours, social links, and the production domain.
Fields still marked `PLACEHOLDER` must be replaced before launch — see
[Before launch](#before-launch).

### The legal block — `src/data/legal.json`

The allergen notice, the frozen-ingredient list, the 24-hour freezing protocol,
the consumer-rights and receipt notices, and the named commercial manager.

**This is legally required content.** It always renders under the menu, is never
collapsed behind a toggle, and should not be shortened. Unlike the menu, it is
genuinely bilingual, because the client supplied both versions.

---

## Languages

Two tiers, and the distinction is deliberate:

**Tier 1 — translated.** All site chrome: navigation, headings, buttons, body
copy, image alt text, the legal block, team roles and bios. These live in
`src/i18n/el.json` and `src/i18n/en.json`.

**Tier 2 — never translated.** The menu. Dish names, descriptions and category
names are Greek in both languages. Several dishes are natively English or mixed
("Tuna tataki με jalapeño sauce", "Bao buns") and render exactly as written. The
menu section keeps `lang="el"` even on the English page, so screen readers
pronounce it correctly.

### Adding or changing a UI string

1. Open `src/i18n/el.json`, find the key, edit the Greek text.
2. Open `src/i18n/en.json`, edit the same key's English text.
3. Run `npm run check` — it fails if a key exists in one file but not the other.

To add a **new** string, add the key to both files, then reference it in the
component as `data-i18n="your.key"`. Keys are grouped by section
(`nav.*`, `menu.*`, `team.*`, `findUs.*`, `a11y.*`).

### How the switch works

Greek is rendered by the server, so the page is correct before any JavaScript
runs. Choosing English swaps the text of every `data-i18n` element from a
dictionary embedded in the page, sets `<html lang>`, and stores the choice in
`localStorage`.

**Known trade-off, accepted:** because the switch is client-side, there is no
separate English URL for Google to index. If English SEO becomes a priority,
Astro can generate a static `/en/` page instead — a contained change, not a
rewrite.

---

## Images

Two stages, because the originals are far too heavy to keep in the repository.

**1. One-time downsample.** `npm run photos` reads the client's originals
(157 MB, 3712×5568) from the folder named at the top of
`scripts/prepare-photos.mjs`, resizes them, strips EXIF, and writes 16 MB of
masters into `src/assets/photos/`. Originals are never modified or committed. Run
this only when the client sends new photos — and update the `SOURCE` path in that
script if the folder moves.

**2. Build time.** Astro generates responsive AVIF and WebP variants with a JPEG
fallback from those masters, at the widths each section actually needs. Every
image carries explicit dimensions, so nothing shifts as the page loads. Only the
first hero image loads eagerly; everything else is lazy.

---

## Performance

Lighthouse, mobile, on the production build:

| | |
|---|---|
| **Performance** | **98** |
| **Accessibility** | **100** |
| **Best Practices** | **100** |
| **SEO** | **100** |
| Largest Contentful Paint | 2.3 s |
| Cumulative Layout Shift | **0** |
| Total Blocking Time | 50 ms |
| First Contentful Paint | 0.9 s |

| | |
|---|---|
| HTML (inc. inlined CSS, structured data) | 129 KB raw, **29 KB gzipped** |
| JavaScript requests | **0** — the ~2 KB of script is inlined |
| Fonts | 4 files, 128 KB total (Greek + Latin, both families) |
| Total `dist/` | 33 MB, almost all image variants the browser chooses between |

The Food/Drinks switch, the menu, and the whole page work with JavaScript
disabled — verified. JavaScript only adds the hero crossfade, the mobile menu
panel, and the language switch.

Two things are load-bearing for those numbers; changing them will cost score:

- **All four font files are preloaded** in `Base.astro`. Without it, `font-display:
  swap` reflows text as each face arrives and CLS goes to 0.118. Preloading takes
  it to 0.
- **Hero slides 2–4 are `display: none` until the carousel is enhanced**
  (`global.css`). They sit stacked inside the viewport, so `loading="lazy"` does
  not defer them — all four would download during the initial load and slow the
  LCP image by more than a second.

---

## Before launch

`npm run check` prints this list at any time.

**Blocking — the site is wrong without these:**

- **Real address and postcode** — `site.json` currently says `PLACEHOLDER`. It
  appears in the Find Us section, the footer, and the structured data.
- **Production domain** — `site.seo.url`. Canonical URLs, Open Graph tags,
  `sitemap.xml` and `robots.txt` all derive from it.
- **Confirm the phone number.** `213 099 1571` was taken from the commercial-manager
  line of the menu. It may not be the reservations number.
- **Confirm the opening hours** — the current ones are invented placeholders.

**Content still outstanding:**

- **9 unpriced items** — 4 dishes and 5 Λαφαζάνη wines. `npm run check` lists them
  by name, label and grape.
- **Team names and bios** for 3 of the 4 members (all 4 bios are placeholder text
  at realistic length, so the layout is already tested).
- **Map and directions links** — `mapUrl` / `directionsUrl` in `site.json`. The
  buttons are hidden while these are empty rather than linking nowhere.
- **Social links** — hidden while empty.
- **Latitude and longitude** — omitted from the structured data while unset.
- **A transparent or vector logo.** The supplied file is a 1080×1080 Instagram
  badge with its background baked in. It works in the navigation bar; on the dark
  hero it reads as a grey disc, so the hero uses a typeset wordmark instead. See
  the comment in `src/components/Hero.astro`.

**One decision to confirm:** the client palette has no light background tone, so
this site proposes a warm off-white, `--sand: #F4F0EA`, drawn from the concrete
surfaces in the photographs. It and `--sand-deep` are defined at the top of
`src/styles/global.css`; changing those two values restyles every light section.

---

## Project structure

```
src/
  assets/photos/      downsampled masters — carousel, gallery, team, logo
  components/         Nav, Hero, Goal, Menu, MenuCategory, MenuItem,
                      Team, Gallery, Contact, FindUs, Footer
  data/               ← content lives here (menu, team, gallery, site, legal)
  i18n/               ← UI strings, el.json + en.json
  layouts/Base.astro  meta tags, structured data, language-switch script
  lib/                i18n lookup, menu formatting, photo resolution
  pages/index.astro   the single page
  styles/global.css   design tokens and all styling
public/               fonts, favicon, robots.txt
scripts/              prepare-photos.mjs, check-content.mjs
```

Colours, type scale and spacing are CSS custom properties at the top of
`src/styles/global.css`. The four client palette colours are used exactly as
supplied:

| | |
|---|---|
| Wood `#813A18` | accents, buttons, links, active states |
| Deep Black `#181414` | text, dark section backgrounds |
| Stone `#625E60` | secondary text |
| Light Stone `#A09A91` | dividers and borders |

On dark sections Wood is replaced by a lighter tint (`--wood-light`), because
Wood on Deep Black is only 2.3:1 and fails accessibility contrast requirements.
