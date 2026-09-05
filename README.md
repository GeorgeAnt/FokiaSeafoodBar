# fokia — seafood bar

A marketing site for the restaurant — a single scrolling homepage plus a
dedicated menu page at `/menu`, a gallery at `/gallery` and the team at `/team`. Built with [Astro](https://astro.build),
which ships **zero JavaScript frameworks** — the homepage loads about 18 KB of
HTML/CSS (gzipped) plus images.

Greek is the default language. The whole site is bilingual, menu included — see
[Languages](#languages).

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

`@playwright/cli` is a devDependency, used only to drive a real browser when
verifying a change — nothing in the built site depends on it:

```sh
npm run preview                                              # serve dist/ on :4321
npx playwright-cli open http://localhost:4321/ --browser chrome
npx playwright-cli screenshot --filename shot.png
npx playwright-cli close
```

`--browser chrome` uses the Chrome already on the machine, so there is no
browser download. Its scratch files go in `.playwright-cli/`, which is ignored.

### Pages

| URL | What's on it |
|---|---|
| `/` | Hero, Our Goal, From the Kitchen, Reserve your spot • Take away, Where to Find Us |
| `/menu` | The full menu and the legally required notices |
| `/gallery` | The photographs, each opening in a lightbox |
| `/team` | The five team members, one photo-and-bio row each |

The menu has a page of its own rather than being a section on the homepage. It
is 98 items across 19 sections — over half the site's DOM — but the real reason
is that a restaurant needs a URL that **is** the menu: the QR code on the table,
the Instagram bio link, the Google Business Profile menu field. An anchor cannot
carry its own title and description, or rank on its own for "fokia menu".

The gallery is split out for the same reasons: 23 full-width photographs are a
large share of the homepage's weight, and a link sent to someone should land on
the photos rather than partway down the homepage.

Nav links to homepage sections are written rooted (`/#goal`, not `#goal`) so
they work from `/menu`, `/gallery` and `/team` too. From the homepage a rooted fragment is still a
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
  "name": { "el": "Σαλάτα surimi", "en": "Surimi salad" },
  "price": 9
}
```

`id` must be unique across both files — it is only used internally, so any short
lowercase name works. `name` and `description` are locale-keyed, the same way a
team member's bio is in `team.json`: `el` is the client's menu exactly as
printed, and `en` is its English translation — **never a different dish, price,
or invented item**, just the same one in the other language.

If a unit or category name was written as a dual literal before the site was
bilingual — `"6 τεμάχια | 6 pieces"`, `"Νερό | Water"` — **split it** across
locales like any other field (`"el": "6 τεμάχια", "en": "6 pieces"`), don't
carry the whole `"X | Y"` string into both. The "|" was just how the client
wrote a bilingual label before there was a mechanism for one.

A couple of fields genuinely are identical in both locales rather than
translated, because translating them would be wrong:

- A dish or drink name that is already English, or a brand — `"Tuna tacos"`,
  `"Bao buns"`, `"Nikka Whisky From The Barrel"` — put the same string in both.
- Wine producer/label names (`"Κτήμα Ζαφειράκη"` → `"Zafeirakis Estate"`) are
  transliterated proper nouns, not translations of meaning — the same treatment
  a person's name gets in `team.json`.

Optional fields, each safe to leave out:

| Field | What it does | Example |
|---|---|---|
| `description` | A line under the name | `{ "el": "…", "en": "…" }` |
| `price` | A number, or `null` if not priced yet | `9`, `2.5`, `null` |
| `unit` | Portion size | `{ "el": "2 τεμάχια", "en": "2 pieces" }` |
| `volume` | For drinks — same in both languages, so it's a plain string | `"330 ml"` |
| `variants` | One price, several choices | `[{ "el": "Σολομός", "en": "Salmon" }, …]` |
| `wine` | Renders on its own line, in medium weight | `{ "producer": {"el":"…","en":"…"}, "label": {…}, "grape": {…}, "style": {…} }` |
| `tags` | Small chips beside the item | `["spicy"]` |

**Prices.** Write them as numbers with a **dot**, not a comma — `2.5`, not `2,5`.
The site formats them the Greek way in both languages when it renders: `2.5`
becomes `2,50 €` and `9` becomes `9 €`.

**Items with no price yet.** Use `"price": null`. The item still appears on the
menu with an em dash where the price goes. Never delete an item just because it
is unpriced, and never write `"price": "??"`.

**Adding a category** — add an object to `categories`:

```json
{
  "id": "nea-katigoria",
  "name": { "el": "Νέα Κατηγορία", "en": "New Category" },
  "unit": { "el": "6 τεμάχια", "en": "6 pieces" },
  "items": [ … ]
}
```

`unit` at the category level applies to every item in it (this is how Maki Rolls
and Inside-outs work). Categories appear in the order they are listed, and the
"jump to" chips update automatically. `Κρασί` additionally uses `subcategories`
(Ποτήρι / Φιάλη); any category can do the same.

Run `npm run check` after editing — it fails if `el` or `en` is missing anywhere
in the menu, the same way it fails on a missing UI string.

### The two phone numbers — `src/data/site.json`

`phone` is the landline and `phoneAfterHours` is the mobile.

On the homepage the two "Κλείστε τη θέση σας • Take away" cards **are** buttons:
tapping one places the call. Each shows the number it will dial, so there is
something to check first.

- **Κλείστε τη θέση σας** dials the landline while the restaurant is open and the
  mobile once it has shut, working that out from `hours.entries` in the same
  file — so if you change the opening hours, the switch follows automatically and
  there is nothing else to update.
- **Take away** always dials the landline, because take away only runs during
  service.

The time is read on the restaurant's clock (Athens), not the visitor's, so a
customer abroad still gets the number that will actually be answered. If a
visitor has JavaScript turned off, both cards show and dial the landline — which
is the right number during service and a working number outside it.

The landline is also the number given to Google in the page's structured data,
since that is the number for the hours the listing publishes. Editing either
number in `site.json` changes it everywhere it appears.

### The team — `src/data/team.json`

Five members currently, shown as alternating rows: the portrait on the left for
the first, the right for the second, and so on down the section. They stack to a
single column on a phone. The section grows by about one row per person, so
adding someone lengthens the homepage rather than tightening a column. Bios read best at roughly 30 to 50
words; much longer and the text column runs well past its portrait. Order in the
file is the order on the page, and `name`, `role` and `bio` each have a Greek
and an English version:

```json
{
  "id": "chef",
  "name": { "el": "Γιάννης Καντάρης", "en": "Yannis Kantaris" },
  "photo": "john.jpg",
  "role": { "el": "Εκτελεστικός Σεφ", "en": "Executive Chef" },
  "bio":  { "el": "…", "en": "…" }
}
```

`photo` is a filename inside `src/assets/photos/team/`. Remove the
`"placeholder": true` line once the real name and bio are in — it is only there so
`npm run check` can report what is still outstanding.

The name is locale-keyed like the role and the bio. If a member's name is the
same in both languages, write it twice rather than dropping one — `npm run check`
treats a missing side as an error. It is also what the portrait's alt text uses,
so both follow the language switch together. You never need to touch
`src/i18n/el.json` or `en.json` for a team member: those keys are derived from
this file.

### The homepage food band — `src/components/Plates.astro`

"From the Kitchen" shows four photographs from the gallery on the homepage. It
does **not** have its own data file: it names four `id`s from
`src/data/gallery.json` and pulls the photo and its alt text from there, so the
alt text stays written in one place.

To change which plates it shows, edit the `PLATE_IDS` list at the top of
`src/components/Plates.astro` to four ids that exist in `gallery.json`. It is
deliberately by id and not "the first four", because the gallery is ordered for
the gallery. If you name an id that is not there, the build stops and tells you
which one — it will not quietly render a gap.

The heading and the button text are ordinary UI strings (`plates.*` in
`src/i18n/`), so they are edited like any other.

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

Name, phone, email, address, geo coordinates, opening hours, social links, the
map link and the production domain. Fields still marked `PLACEHOLDER` must be replaced before
launch — see [Before launch](#before-launch).

**Changing the opening hours:** each entry in `hours.entries` must list **every
day it covers**, not just the first and last of a range. Where to Find Us works
out the ranges itself and only joins days that actually run consecutively, so
`["Tuesday", "Thursday"]` correctly renders as two separate rows rather than
"Tue – Thu", which would claim a Wednesday the restaurant is shut. Days in
`hours.closed` are listed on the page as closed on purpose — dropping a shut day
entirely just leaves a visitor guessing. That list is empty at the moment,
because the restaurant opens every day; leave the key in place rather than
deleting it. Day names are the English schema.org
spellings in the file whatever the page language; the Greek day names come
from `hours.<Day>` in `src/i18n/`.

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
collapsed behind a toggle, and should not be shortened. It is bilingual, same
as the rest of the menu now, because the client supplied both versions.

---

## Languages

Everything on the site is translated: navigation, headings, buttons, body copy,
image alt text, the legal block, team roles and bios, and — since the client
asked for it — the menu itself. Two places hold the strings:

- **`src/i18n/el.json` / `en.json`** — site chrome: nav, headings, buttons, body
  copy, `a11y.*` labels.
- **Locale-keyed JSON fields** — content that lives in `src/data/`, not the
  i18n files: team names/roles/bios in `team.json`, gallery alt text in
  `gallery.json`, and dish/drink names, descriptions, units, variants and wine
  fields in `menu-food.json` / `menu-drinks.json`. Each of these is
  `{ "el": "…", "en": "…" }` per field, and `src/lib/i18n.ts` flattens them into
  the same dictionary the chrome strings use — so a new team member or menu item
  needs no entry in `el.json` / `en.json`.

Several dish and drink names are intentionally identical in both locales rather
than translated — see the menu section above for which, and why. Several dishes
are natively English or mixed ("Tuna tataki με jalapeño sauce", "Bao buns") and
render exactly as written in both languages, same as before.

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

Controls that only exist once JavaScript runs — the hero carousel dots, every
button in the gallery lightbox — are built from a hidden template
*after* that swap has happened, so they have to ask for it again. They do. If you
add a new one and its label comes out Greek on the English page, that is the step
that is missing; `CLAUDE.md` describes it.

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
image carries explicit dimensions, so nothing shifts as the page loads. The nav
logo, the first hero photo and the first row on `/team` load eagerly — each is
already in the initial viewport and is its page's LCP image. Everything else on
the site is lazy. The gallery additionally builds one 1400px variant per photo,
which is both what the lightbox shows and the link a visitor without JavaScript
follows.

### Fonts

Self-hosted, **static** builds — not variable. Google's variable fonts ship
unhinted (`ttfautohint` does not support variable fonts), and Windows leans on
hinting at text sizes, which made the type look blocky there. The static builds
are hinted.

The cost is losing arbitrary weight interpolation, which this site never used.
It renders exactly four combinations, and only those are shipped:

| Family | Role | Weights | Scripts |
|---|---|---|---|
| Manrope | Everything | 400 body · 500 secondary · 600 labels and buttons · 700 headings | Greek + Latin |

One family for the whole site, which is the client's decision: the hierarchy is
carried by weight rather than by pairing a serif against a sans.

`font-synthesis: none` is set on `body`, so a weight that is not in that list
will **not** be faked — it falls back to the nearest real one. Adding a weight
in the CSS means adding its `@font-face` and files too.

**Manrope has no italic, in any weight**, which is why synthesis is off for
slant as well. Left on, the browser shears an upright into a fake oblique, and
mechanically slanted Greek is visibly wrong. The practical consequence: writing
`font-style: italic` anywhere now renders as ordinary upright text, with no
error. The wine producer line on `/menu` used to be the one real italic and is
set in weight 500 instead.

The ten `.woff2` files in `public/fonts/` are **copied by hand**, verbatim, out
of the `@fontsource/*` packages in `package.json` — there is no script and no
build step that does it, which is why those packages are dependencies rather
than devDependencies. Their `files/` directory uses exactly the names the site
uses, so adding a weight is a copy and two `@font-face` blocks (Latin and
Greek); the `unicode-range` values for both subsets are in each package's
`unicode.json` and are identical across the two families.

### Favicons

`npm run favicons` regenerates them from `src/assets/photos/backgrounds/logo-clean.png`
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
gallery was split onto its own page, before the hero, nav, footer and Take away
sections were reworked, and before the homepage was recomposed — re-run before
quoting them.** The page-weight figures below the table are current, measured
against the build in `dist/`.

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
| `/` (inc. inlined CSS, structured data) | 81 KB raw, **21 KB gzipped** |
| `/menu` | 99 KB raw, **24 KB gzipped** |
| `/gallery` | 86 KB raw, **21 KB gzipped** |
| JavaScript requests | **0** — every script is inlined |
| Fonts | 10 files, 162 KB total (Greek + Latin, both families) — 6 preloaded |
| Total `dist/` | 40 MB across 390 files, almost all image variants the browser chooses between |

The Food/Drinks switch, the menu, and the whole page work with JavaScript
disabled — verified. JavaScript only adds the hero crossfade, the mobile menu
panel, the gallery lightbox, the language switch and the scroll reveal. With it
off, a gallery tile is still a link straight to the full-size photo, and every
band on the homepage is simply visible from the start.

Two things are load-bearing for those numbers; changing them will cost score:

- **The six above-the-fold font faces are preloaded** in `Base.astro`. Without
  it, `font-display: swap` reflows text as each face arrives and CLS goes to
  0.118. Preloading takes it to 0. Not all eight: Manrope 500 is secondary copy
  and the wine lines on `/menu`, never above the fold, so preloading it would
  push bytes ahead of the LCP image for glyphs that may never paint.
- **Hero slides 2–4 are `display: none` until the carousel is enhanced**
  (`global.css`). They sit stacked inside the viewport, so `loading="lazy"` does
  not defer them — all four would download during the initial load and slow the
  LCP image by more than a second.

---

## How the homepage scrolls

Two things happen as you scroll the homepage on a desktop or tablet:

- **The page settles on the bands.** When a scroll ends near the boundary
  between two sections, it clicks that section neatly under the navigation bar.
  It does **not** force one section per scroll: several bands are taller than a
  laptop screen — Where to Find Us is one and a half on a laptop — so being
  forced section-by-section would hide their bottom halves. Tall bands scroll through
  normally, then the next one settles into place.
- **Each band rises into view** as it arrives, over about seven tenths of a
  second. The hero is excluded, because it is the first thing painted.

Both switch off completely if the visitor's device is set to reduce motion, and
the settling is desktop and tablet only. Neither affects the menu or the gallery.

If you add a new band to the homepage and want it to rise in like the others,
put `data-reveal` on the block inside it. Read the note in `CLAUDE.md` first —
there is one rule about which script is allowed to hide things, and breaking it
is how a section ends up invisible.

---

## Accessibility

The site was audited against the Web Interface Guidelines and the findings
fixed. Most were invisible; three changed something you can see, so they are
worth knowing about before you look at the site and wonder:

- **Tap targets are 44px.** The social icons in the nav, the language button, the
  menu's Food/Drinks tabs and its jump-to-category chips all grew to the size a
  finger actually needs. The social marks were later drawn larger inside those
  same 44px boxes — 19px to 24px — which changes how they look without changing
  what they cost the bar.
- **The heading above the legal notices** now renders as the small uppercase
  label it was always meant to be. A stylesheet rule had been pointing at the
  wrong tag, so it had been rendering at full heading size.

- **The nav links sit in the middle of the bar**, with the logo at the left and
  the social icons and language button at the right.

Two things are recorded trade-offs rather than oversights:

- **The carousel dashes** sit at 1.7–2.3:1 against the photos, under the 3:1 a
  control should meet. They were given a backing panel once and it was reverted
  for the lighter look. They are a position indicator, not the control.
- **The hero carousel can no longer be stopped.** The slides change every 3
  seconds and run indefinitely. The stop button that used to sit in the
  bottom-right of the photo was removed at your request, and with it the only
  way a visitor had to halt the motion — hovering the photo still holds it, but
  there is no hover on a phone. This is a known accessibility failure (WCAG
  2.2.2, "Pause, Stop, Hide"), not an oversight, and it is the one item in this
  file that would fail an audit outright. Putting the button back is a small
  change if you ever want it.
- **English has no separate URL**, as described under Languages above.

The Lighthouse accessibility score in the table above predates all of this and
predates the page split — re-run it before quoting it.

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
(21 3099 1571), email (fokiaseafoodbar@gmail.com), opening hours (Mon–Sat
18:00–00:00, Sun 16:00–00:00, open seven days), Instagram and Facebook, and
the map coordinates (38.04136874195106, 23.54054582764447), supplied by the
client — so the `geo` block now appears in the structured data instead of being
omitted.
The map link addresses the restaurant by its **Place ID**, in the form Google
documents for exactly this:

    https://www.google.com/maps/place/?q=place_id:ChIJJ4njfgCvoRQRnpRBOQOfYQk

To change it, get the new Place ID from Google's
[Place ID finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
and swap the one string. There is nothing else in the URL to get wrong.

**Why not the long URL the browser gives you.** A `/maps/place/…` URL ends in a
`data=` blob that is length-prefixed — `!4m6` means "six tokens follow", `!3m5`
means "five" — so deleting a token that looks redundant leaves the counts short,
Google cannot parse it, and the button silently degrades to a name search on the
wrong pin. Nothing errors, the link still opens Maps, and a build, a content
check and a review all pass. That shipped once. The Place ID form has no such
structure and nothing safe-looking to delete, which is the whole reason for it.

`directionsUrl` has been deleted: the "Get directions" button was removed a
while back and nothing had rendered the field since.

**Content still outstanding:**

- **9 unpriced items** — 4 dishes and 5 Λαφαζάνη wines. `npm run check` lists them
  by name, label and grape.
- **Mary's portrait.** Her name, role and bio are all real — the only thing
  missing is the photograph. `mary.jpg` is the generated placeholder graphic,
  which has the word PLACEHOLDER drawn across it and **will be visible on the
  page if it ships**. The entry keeps `"placeholder": true` for exactly that
  reason, so `npm run check` keeps counting it (1/5); drop the flag when the
  real photo replaces the file. The other four members are complete.
- **Social links** — hidden while empty.
- **A cropped or vector logo.** `logo-clean.png` carries the nav, the footer and
  the favicons. It is the only logo file. One thing would still improve it: the
  file is 1672×940 around an 888×899 badge — 47% of the width is empty field,
  which every layout using it has to size around.

  The other complaint that used to sit here — that the concrete texture is baked
  *inside* the badge, so on the black hero it read as a pale disc rather than a
  mark on the ground — no longer applies, because the hero no longer shows the
  badge. The name is set in type there instead.

  Not urgent any more. The nav crops the field away with `object-fit: cover` on
  a square box rather than shipping a trimmed copy, so the empty field costs
  layout nothing there. It still costs bytes: the nav badge is 80px wide but has
  to be served at 142px so the crop fills it. A tight crop or a vector would still be better, and
  would remove the one fragile assumption that trick rests on — that the badge
  stays horizontally centred in its canvas.

**One decision to confirm:** the client palette has no light background tone, so
this site proposes one, `--salt: #E2E8EB` — a cool off-white drawn from the
concrete and stone the photographs were actually shot on. Those surfaces are
cold, and matching them sets the food photography into the page rather than on
top of it; a warm cream also pulls the client's brick red toward terracotta,
which the rusted-metal shopfront sign in the team photographs is not. It and
`--salt-deep` are defined at the top of `src/styles/global.css`; changing those
two values restyles every light section.

---

## Keeping these docs current

`README.md` and `CLAUDE.md` are updated in the same change as the code, not
afterwards — this file explains *what* to edit and what is outstanding, and
`CLAUDE.md` explains the rules and gotchas to whoever works on the code next.
`AGENTS.md` is a byte-identical copy of `CLAUDE.md` (`cp CLAUDE.md AGENTS.md`).

Measured figures here — contrast ratios, page weights, nav clearance, Lighthouse
scores — should be re-measured when they change rather than carried forward.
Several have gone stale before.

---

## Project structure

```
src/
  assets/photos/      downsampled masters — carousel, gallery, team, backgrounds
  components/         Nav, Hero, Goal, Plates, Menu, MenuCategory, MenuItem,
                      Team, Gallery, Contact, FindUs, Footer
  data/               ← content lives here (menu, team, gallery, site, legal)
  env.d.ts            types for the language switcher's window.fokiaI18n
  i18n/               ← UI strings, el.json + en.json
  layouts/Base.astro  meta tags, structured data, language-switch script
  lib/                i18n lookup, menu formatting, photo resolution
  pages/index.astro   homepage — hero, goal, plates, contact, find us
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

### Surfaces

The homepage is one dark ground. Every band below the hero is Charcoal, and the
sections are told apart by a hairline between them rather than by a change of
tone:

| Class | Background | Where |
|---|---|---|
| *(default)* | `--salt` | Menu, Team, Gallery — the other three pages |
| `.section-dark` | `--charcoal` `#221F1F` | Our Goal, From the Kitchen, Reserve your spot • Take away, Where to Find Us |
| — | `--black` `#181414` | Hero, navigation bar, footer |

Charcoal is one step up from Deep Black, and the hero, the bar and the footer
stay Deep Black, so the top and bottom of the page sit slightly deeper than the
middle. The line between bands is 1px of Light Stone at 30% — the same line the
navigation bar has always had under it.

**If that line is removed the page loses its structure**, because the tone
change that used to separate the bands is no longer there to fall back on.

This replaced an alternating light / mid / dark scheme, and one thing it traded
is worth knowing: Reserve your spot • Take away used to be a light band
*specifically* so that its photographs did not run into From the Kitchen's
directly above. The light strip around its two panels was the boundary. Now the
hairline is, which is thinner — so the fact that those photos are **inset panels
rather than full-bleed** is what keeps the two groups apart. Don't make them
full-bleed.

Text was re-measured on the new ground: headings and buttons 13.2:1, body and
muted text 5.9:1, eyebrows and the phone number 5.8:1.

The text on the two Take away cards sits over photographs rather than over the
band, so it is measured against the rendered pixels instead: worst single pixel
11.8:1 on the titles and 12.7:1 on the numbers, checked at 320, 390, 768, 1024
and 1366px wide, in both languages, and **with the mouse on the card as well as
off it** — the picture brightens on hover, so that is the harder case. If those
two photos are ever swapped, or the cards gain another line, that measurement has
to be redone — see CLAUDE.md for how.

`.section-stone`, the old mid tier, is now unused. It is kept in the stylesheet
on purpose — it and the `--wood-pale` accent only make sense together — and is
labelled as such so nobody removes half of it.

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

Team roles, menu subheadings and focus rings read `--accent`, so adding a
section to any tier tints them correctly with no extra CSS. Every text/background
pair has been measured against WCAG AA.

Two things that used to be on that list no longer are. Section eyebrows are gone
from the site altogether. And the labels in Where to Find Us — Address, Opening
hours, Phone, Email — are stone rather than Wood at the client's request: they
are the same colour as the text under them, and bold weight is what tells them
apart.
