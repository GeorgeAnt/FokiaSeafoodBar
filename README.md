# fokia — seafood bar

A marketing site for the restaurant — a single scrolling homepage plus a
dedicated menu page at `/menu` and a gallery at `/gallery`. Built with [Astro](https://astro.build),
which ships **zero JavaScript frameworks** — the homepage loads about 18 KB of
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
npm run favicons  # regenerate the favicons from the logo (only if it changes)
```

Deploy by uploading `dist/` to any static host — Netlify, Vercel, Cloudflare
Pages, GitHub Pages, or plain nginx. There is no server and no database.

### Pages

| URL | What's on it |
|---|---|
| `/` | Hero, Our Goal, the Team, Reserve your spot • Take away, Where to Find Us |
| `/menu` | The full menu and the legally required notices |
| `/gallery` | The photographs, each opening in a lightbox |

The menu has a page of its own rather than being a section on the homepage. It
is 98 items across 19 sections — over half the site's DOM — but the real reason
is that a restaurant needs a URL that **is** the menu: the QR code on the table,
the Instagram bio link, the Google Business Profile menu field. An anchor cannot
carry its own title and description, or rank on its own for "fokia menu".

The gallery is split out for the same reasons: 23 full-width photographs are a
large share of the homepage's weight, and a link sent to someone should land on
the photos rather than partway down the homepage.

Nav links to homepage sections are written rooted (`/#team`, not `#team`) so
they work from `/menu` and `/gallery` too. From the homepage a rooted fragment is still a
same-document jump, so nothing reloads.

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

Name, phone, email, address, opening hours, social links, map links and the
production domain. Fields still marked `PLACEHOLDER` must be replaced before
launch — see [Before launch](#before-launch).

`street` and `city` are locale-keyed so the Greek page shows `Λάσκου 3
Ελευσίνα` rather than a Latin transliteration. Where to Find Us shows the street
and city only; the postcode and country stay in the structured data, which is
what local search reads.

**Adding a social network:** add an entry to `social` with an `id`, `label` and
`url`. The `id` picks the icon out of `src/components/SocialLinks.astro` — add
the SVG path there first, or the entry is skipped rather than rendered blank.
Order in the file is the order shown in the nav and the footer.

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
first hero photo and the hero logo load eagerly; everything else is lazy. The
gallery additionally builds one 1400px variant per photo, which is both what the
lightbox shows and the link a visitor without JavaScript follows.

### Fonts

Self-hosted, **static** builds — not variable. Google's variable fonts ship
unhinted (`ttfautohint` does not support variable fonts), and Windows leans on
hinting at text sizes, which made the type look blocky there. The static builds
are hinted.

The cost is losing arbitrary weight interpolation, which this site never used.
It renders exactly four combinations, and only those are shipped:

| Family | Weights | Scripts |
|---|---|---|
| Inter | 400, 500, 600, and 400 italic | Greek + Latin |
| EB Garamond | 600 | Greek + Latin |

`font-synthesis-weight: none` is set on `body`, so a weight that is not in that
list will **not** be faked — it falls back to the nearest real one. Adding a
weight in the CSS means adding its `@font-face` and files too. The italic is a
real face rather than a browser-sheared upright; it is used by the wine lines
on `/menu`.

### Favicons

`npm run favicons` regenerates them from `src/assets/photos/logo-clean.png`
into `public/`. Run it only if the logo changes. The badge is centred in a wide
transparent field there, so the script trims to the badge and normalises it to
512×512 first; every crop in it is expressed against that square.

It produces two different pieces of artwork on purpose. **Tab icons use the
wave-in-the-o monogram**, cropped out of the badge — the full logo is an
illegible grey smudge at 16px, because the wordmark and "SEAFOOD BAR" collapse
into a few pixels. **The Apple touch icon uses the whole badge**, since iOS
renders it large on the home screen where the wordmark reads.

| File | Size | Artwork |
|---|---|---|
| `favicon.ico` | 16, 32, 48 | monogram |
| `favicon-96x96.png` | 96 | monogram |
| `apple-touch-icon.png` | 180 | full badge |

If the client supplies a tighter or vector logo, replace `logo-clean.png` and
re-run — and reconsider the crop box (`MONOGRAM` in the script), which is
measured against the normalised 512×512 badge, not the file's own pixels.

---

## Performance

Lighthouse, mobile, on the production build. **These were measured before the
gallery was split onto its own page and the hero, nav, footer and Take away
sections were reworked — re-run before quoting them.** The page-weight figures
below the table are current and measured against the build in `dist/`.

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
| `/` (inc. inlined CSS, structured data) | 69 KB raw, **18 KB gzipped** |
| `/menu` | 92 KB raw, **22 KB gzipped** |
| `/gallery` | 77 KB raw, **20 KB gzipped** |
| JavaScript requests | **0** — every script is inlined |
| Fonts | 10 files, 162 KB total (Greek + Latin, both families) — 6 preloaded |
| Total `dist/` | 40 MB across 390 files, almost all image variants the browser chooses between |

The Food/Drinks switch, the menu, and the whole page work with JavaScript
disabled — verified. JavaScript only adds the hero crossfade, the mobile menu
panel, the gallery lightbox and the language switch. With it off, a gallery tile
is still a link straight to the full-size photo.

Two things are load-bearing for those numbers; changing them will cost score:

- **The six above-the-fold font faces are preloaded** in `Base.astro`. Without
  it, `font-display: swap` reflows text as each face arrives and CLS goes to
  0.118. Preloading takes it to 0. Not all ten: Inter 500 sits lower in the page
  and the italic only appears on `/menu`, so preloading those would push bytes
  ahead of the LCP image for glyphs that may never paint.
- **Hero slides 2–4 are `display: none` until the carousel is enhanced**
  (`global.css`). They sit stacked inside the viewport, so `loading="lazy"` does
  not defer them — all four would download during the initial load and slow the
  LCP image by more than a second.

---

## Before launch

`npm run check` prints this list at any time.

**Blocking — the site is wrong without these:**

- **Production domain** — `site.seo.url`. Canonical URLs, Open Graph tags,
  `sitemap.xml` and `robots.txt` all derive from it.
- **Check the Greek spelling of the address.** The client supplied it in Latin
  script (`Laskou 3, Elefsína`); `site.json` renders `Λάσκου 3, Ελευσίνα` on the
  Greek page, which needs a native-speaker check.

**Confirmed and in place:** address (Laskou 3, Elefsina 19200), phone
(21 3099 1571), email (fokiaseafoodbar@gmail.com), opening hours (Tue–Fri
16:00–00:00, Sat–Sun 14:00–00:00, closed Monday), Instagram and Facebook.
The map link is built from the address, so it works now; swap it for a Google
Maps place link if you want the exact pin. `directionsUrl` is still in
`site.json` but nothing renders it — the "Get directions" button was removed, so
delete the field or restore a button if it is wanted back.

**Content still outstanding:**

- **9 unpriced items** — 4 dishes and 5 Λαφαζάνη wines. `npm run check` lists them
  by name, label and grape.
- **Team names and bios** for 3 of the 4 members (all 4 bios are placeholder text
  at realistic length, so the layout is already tested).
- **Map link** — `mapUrl` in `site.json`. The button is hidden while it is empty
  rather than linking nowhere.
- **Social links** — hidden while empty.
- **Latitude and longitude** — omitted from the structured data while unset.
- **A cropped or vector logo.** `logo-clean.png` has a transparent surround, so
  it now carries the hero and the footer, and the typeset wordmark it replaced is
  gone. Two things would still improve it: the concrete texture is baked *inside*
  the badge, so on the black hero it reads as a pale disc rather than a mark on
  the ground; and the file is 1672×940 with the badge centred in a wide empty
  field, about 44% of the width, which the layout has to size around. A tight
  crop or a vector would fix both. It is now the only logo file: the opaque
  512px square was deleted with the nav logo it existed for, and the favicons
  are generated from this one.

**One decision to confirm:** the client palette has no light background tone, so
this site proposes one, `--salt: #E2E8EB` — a cool off-white drawn from the
concrete and stone the photographs were actually shot on. Those surfaces are
cold, and matching them sets the food photography into the page rather than on
top of it; a warm cream also pulls the client's brick red toward terracotta,
which the rusted-metal shopfront sign in the team photographs is not. It and
`--salt-deep` are defined at the top of `src/styles/global.css`; changing those
two values restyles every light section.

---

## Project structure

```
src/
  assets/photos/      downsampled masters — carousel, gallery, team, logo-clean
  components/         Nav, Hero, Goal, Menu, MenuCategory, MenuItem,
                      Team, Gallery, Contact, FindUs, Footer
  data/               ← content lives here (menu, team, gallery, site, legal)
  i18n/               ← UI strings, el.json + en.json
  layouts/Base.astro  meta tags, structured data, language-switch script
  lib/                i18n lookup, menu formatting, photo resolution
  pages/index.astro   homepage — hero, goal, team, contact, find us
  pages/menu.astro    the menu, at /menu
  pages/gallery.astro the photographs, at /gallery
  styles/global.css   design tokens and all styling
public/               fonts, favicons, robots.txt
scripts/              prepare-photos.mjs, prepare-favicons.mjs, check-content.mjs
```

Colours, type scale and spacing are CSS custom properties at the top of
`src/styles/global.css`. The four client palette colours are used exactly as
supplied:

| | |
|---|---|
| Wood `#813A18` | accents, buttons, links, active states, category rules |
| Deep Black `#181414` | primary text, dark section backgrounds |
| Stone `#625E60` | all secondary text on light sections, and the Find Us band |
| Light Stone `#A09A91` | dividers, borders, secondary text on dark sections |

### Three surface tiers

The page steps light → mid → dark, so Stone does structural work rather than
only tinting text:

| Class | Background | Sections |
|---|---|---|
| *(default)* | `--salt` | Menu, Team, Gallery |
| `.section-stone` | `--stone` | Our Goal, Where to Find Us |
| `.section-dark` | `--black` | Hero, Reserve your spot • Take away, footer |

No two bands in a row share a background. Our Goal is on the mid tier because
the hero above it is black — as a dark section it ran into the hero with no
boundary. Stone carries the two text-only sections, which is what suits a mid
grey: neither has photographs sitting on it.

### The `--accent` token

Wood is only legible on light ground — **2.3:1 on Deep Black and 1.3:1 on
Stone**, both far below the 4.5:1 needed for text. So each tier redefines a
single `--accent` token, and no rule references `--wood` directly for text:

| Tier | `--accent` | Contrast |
|---|---|---|
| salt | `--wood` `#813A18` | 6.6:1 |
| stone | `--wood-pale` `#F0E0D8` | 5.0:1 |
| dark | `--wood-light` `#C98A76` | 6.4:1 |

Both tints lighten Wood along the oxidation path — weathered rust, dusty and
pink — rather than toward orange, which lands on terracotta.

Eyebrows, field labels, team roles, menu subheadings and focus rings all read
`--accent`, so adding a section to any tier tints them correctly with no extra
CSS. Every text/background pair on all three tiers has been measured against
WCAG AA.
