# fokia — seafood bar

Astro marketing site for a Greek seafood restaurant. Four pages: `/` (scrolling
homepage), `/menu`, `/gallery`, `/team`. `README.md` is for the person editing
content and deploying; this file is for whoever works on the code next.

This file is **rules and traps**, not history. Every entry is here because
someone was caught by it once. Check a claim before repeating it — measured
figures (contrast ratios, page heights, clearances) should be re-measured, not
copied forward, and a removed feature means removing its rule too.

`AGENTS.md` is a byte-identical copy: edit `CLAUDE.md`, then `cp CLAUDE.md
AGENTS.md`. Never hand-edit both.

## Commands

```
npm run dev      # dev server
npm run build    # production build into dist/
npm run preview  # serve dist/ on :4321 (astro preview stop / status / logs)
npm run check    # content validation + what is still missing from the client
npx astro check  # type check (should stay at 0 errors)
npm run photos   # re-run the one-time photo downsample (only for new originals)
npm run favicons # regenerate favicons from logo-clean.png (only if it changes)
npm run og       # regenerate public/og-image.jpg (only if its photo changes)
NOINDEX=1 npm run build   # a build that must not be indexed (preview / staging)
```

Node is installed but **not on the shell PATH**:
`$env:Path = "$env:ProgramFiles\nodejs;" + $env:Path`

## Content rules

- **Content changes go in JSON, not components** — `src/data/` and `src/i18n/`.
- **The menu is real client data.** Never invent a dish, a price, or a
  translation that changes what is served. Items with `"price": null` are
  unpriced by the client and must still render, with an em dash.
- **The menu is bilingual.** `name`, `description`, `unit`, `variants` and the
  `wine` fields in `menu-food.json` / `menu-drinks.json` are locale-keyed
  (`{ "el": "…", "en": "…" }`), like `team.json`, and flow through
  `menuGroupKeys` in `src/lib/i18n.ts`. `el` is the printed menu and is the
  source of truth. `volume` (`"250 ml"`) stays a plain string.
  - A dual literal the client wrote before the site was bilingual
    (`"6 τεμάχια | 6 pieces"`) is **split** across locales, never carried over
    as one string in both.
  - Some strings are legitimately identical in both locales: names already
    English or brand names ("Tuna tacos", "Nikka Whisky From The Barrel"), and
    wine producer/label names, which are transliterated proper nouns.
- **`src/data/legal.json` is legally required.** It always renders under the
  menu, never collapsed, never shortened.
- **`npm run check` compares i18n *keys*, not values.** It will not notice an
  English string sitting in `el.json` — that has happened once. Read the diff on
  a locale file. `footer.rights` is deliberately the same English line in both.
- **Update `README.md` and `CLAUDE.md` in the same change**, not afterwards.

## The homepage is one ground with drawn edges

Every band below the hero is `--charcoal`; the hero, nav and footer are
`--black`. What separates one band from the next is a **line, not a tone**:
`.section-dark` carries `border-top: 1px solid var(--rule)`, and
`main > .section-dark:last-child` closes the run against the footer. Remove that
border and you do not get a subtler page, you get one undifferentiated column —
the tone step that used to do the work is gone.

The older rule was "no two bands in a row share a background", and the whole
alternating-tier system existed to serve it. **Do not reinstate it piecemeal.**
`.section-stone`, `.btn--ghost`, `--wood-pale`, `.wrap--narrow` and
`.section--tight` are all gone from the stylesheet; do not re-add one to
"restore" a tier.

**Each band uses a different layout, with one deliberate pairing.** Hero is a
split; Our Goal is the same split mirrored; From the kitchen is a centred head
over a staggered photo row; Take away is a 2x2 of rounded cards (two dial on
tap, two open onto a film); Find Us is a centred heading over a text column and
a photograph. Before adding a band, check what shape its neighbours already are
— Find Us is an image-and-text split again, so that composition is in use.

**Our Goal continues the hero's grid on purpose.** Its photo column is the same
half-width full-bleed track the carousel occupies, at the same
`min(88vh, 52rem)`, switching at the same 60rem breakpoint, on the opposite
side — the two bands read as one 2x2 with the pictures on a diagonal. If the
hero's breakpoint, `min-height` or column split changes, this band moves with
it: they are one composition in two files.

**The four band headings are one size** (`--step-2`): `.goal__heading`,
`.plates__head h2`, `.contact__head h2`, `.find__head h2`. None uses
`.section-head` (`--step-3`) — that class and a per-band override have equal
specificity, so the size would depend on source order. `.section-head` owns
`/menu`, `/gallery` and `/team`, where `--step-3` is a page title.

**There are no section eyebrows.** Every section used to render one from its
`nav.*` key, which in five of six cases was the heading verbatim — two titles
stacked. Do not add one back without new copy that says something the heading
does not; the test is *does this label distinguish anything?* `.eyebrow` still
exists in the CSS and matches no markup, because
`.section-head p:not(.eyebrow)` needs it (see the specificity gotcha below).

**When a band's title and its nav label say the same words, they share
`nav.*`.** Our Goal renders `nav.goal` and Take away renders `nav.contact`;
`goal.heading` and `contact.heading` were both deleted rather than kept holding
identical text. A band whose heading genuinely differs keeps its own key.

**Scroll-snap is `proximity`, and `mandatory` breaks the page.** Three of the
four bands are taller than the viewport, so `mandatory` pulls the reader out of
a band mid-read and gives a short band a whole screen. Gated at 48rem and on
`prefers-reduced-motion`. Full scroll-hijacking is not on the table either: it
would hide the bottom of the tall bands and break every `/#anchor`.

## Palette

**The light neutral is deliberately cold.** `--salt` is the one colour the
client did not supply. The photos were shot on grey concrete; a warm cream drags
`--wood` toward terracotta, which is the wrong read. `--wood-light` lightens
Wood along an oxidation path — dusty and pink, never orange. Warming these back
up undoes the palette.

- Colours on a section come from the tokens its surface tier sets (`--accent`,
  `--text-muted`, `--rule`). **Never reference `--wood` directly for text**: it
  is 2.3:1 on Deep Black. `--wood` survives as a *surface* only on `/menu`'s
  selected tab.
- **"Stone" on a dark ground always means `--light-stone`, never `--stone`**,
  which measures 2.6-2.9:1 there and fails outright.
- `.btn--primary` is every button on the site (three CTAs, all on the homepage).
  Its hover goes *lighter*, to `--salt`; darkening a mid stone walks the label
  back toward the 2.9:1 that ruled `--stone` out.
- **A dark surface inside the light tier must carry the dark tier's tokens
  itself** — `.nav`, `.section-dark` and `.lightbox` all do. Painting the
  background without them leaves links at `--stone` and hover at `--wood`. A
  `<dialog>` appended to `<body>` inherits the *light* tier, which is why
  `.lightbox` re-tints `--accent`.

## Nav

**The link list is never shown inline, at any viewport width** — the burger
toggle is the only way in, on desktop as much as on a phone. Adding a seventh
link costs the bar nothing; it is one more row in the panel. The bar is a
three-track grid (logo / social icons / utilities), and the panel spans all
three. `1fr auto 1fr` on a phone (icons centred), `1fr auto auto` from 48rem
(icons rejoin the utilities); only `.nav__social`'s `justify-self` flips.

- **A grid, not a flex row, because a grid cannot wrap.** The old row overflowed
  a 320px bar and dropped the toggle onto a second line — reported from a
  device. **`scrollWidth` is the wrong test for a wrapping row** and passed
  while the bar was broken: compare `.nav__toggle`'s `top` against
  `.nav__logo`'s `bottom` instead.
- **The bar's `min-height` (6rem) + 1px border = 97px, and `scroll-padding-top`
  on `<html>` must match it.** Change one without the other and every anchored
  heading goes behind the bar. It is `calc(6.0625rem - 2px)`: the overshoot
  tucks the section boundary *under* the bar so a fractional device scale cannot
  anti-alias the seam into a hairline.
- **`scroll-padding-top` is the ONLY offset.** A `scroll-margin-top` on a target
  stacks with it rather than replacing it — that double-count once landed
  sections 100px low.
- The current-page marker keeps a `--accent` underline while hover is `--salt`,
  deliberately: "the page you are on" must not look like "the link under your
  pointer". The focus ring is `--accent` for the same reason.
- `.nav__logo` shows the badge by cropping (`object-fit: cover`) rather than
  with a second asset. `logo-clean.png` is 1672x940 with the 888x899 badge
  centred, so 47% of its width is empty field. **This works only because the
  badge is horizontally centred** — a replacement logo that is off-centre crops
  wrong, silently. It is also why `Nav.astro` passes `sizes="142px"` rather than
  the box's own 80px: srcset picks from layout width, and cover throws away 47%.
- `.lang` and `.social a` are a deliberate 32px, under this site's usual 44px
  target and over the 24px WCAG 2.5.8 floor — same exception the hero dots take.

## i18n

Greek is server-rendered; the switcher is a client-side swap over `data-i18n*`
attributes, so the page is correct before any JS runs. English is therefore
**not indexable** — both locales share one URL, and the three `hreflang` tags
all point at it. Fixing that means locale-routed pages (`/en/...`), a real
change to routing, the switcher and the nav. Do not "correct" the hreflang block
on its own.

- **Keys are built at runtime from data and will not grep**: `team.${id}.name`,
  `gallery.${id}.alt`, `legal.${id}`, `hours.${day}`, and from a locale code —
  `lang.${other}`, `lang.short.${other}`, `a11y.lang.${other}`. Deleting one
  breaks a page silently; `npm run check` never asks whether a key is *used*.
  Classes too: `.menu__panel--food` / `--drinks` exist only as
  `menu__panel--${view.id}`. A mention inside a comment is not a use.
- `lang.el` / `lang.en` and `lang.short.*` are autonyms and are **identical in
  both locale files** on purpose. `a11y.lang.*` are sentences and do differ.
- Day names are `hours.<Day>`, written out in full. There is no abbreviated set;
  do not reintroduce one for a narrow layout — check the measure first.

**Controls that only work with JS live in a `<template>`** (`#hero-controls-template`,
`#lightbox-template`), so a visitor without JS is never shown a dead control.
The gallery *tiles* are the deliberate exception: each is an `<a>` to the
full-size photo, so it still goes somewhere real.

**A cloned control must be handed to `window.fokiaI18n` or its labels stay
Greek.** Template content is a separate document fragment, so the switcher's
`querySelectorAll` pass never sees inside it. Base's inline script exposes:

- `refresh()` — re-apply the current locale over the whole document, clones
  included. Call it right after `append`.
- `setLabelKey(el, key)` — for a control whose label changes with its *state*
  (the nav toggle is the only caller). It is the only sanctioned way for a
  script to change an `aria-label`.

**Both take a key, never a string** — `dict` is private to the closure, and a
script writing the words itself would hard-code both locales and go stale. A
`setTextKey` (the same idea for visible text) has been written and deleted twice,
each time with its only caller; if it is needed again, write it again, still
taking a key. Both are called with `?.`; the type lives in `src/env.d.ts`.

## Take away (Contact)

**Each card is one control that places one call, and the clock picks the
number.** The whole panel is an `<a href="tel:…">`, so it must commit to one
number before the tap. `site.json` holds `phone` (landline) and
`phoneAfterHours` (mobile); the server renders the landline everywhere and the
script swaps it when the restaurant is shut.

- **Three of the four swap; take away does not.** Take away can only happen
  during service. A reservation, a party enquiry and a special order are all
  things people ring about at midnight. Ask what the call is *for*, not which
  row the card is in.
- The four attributes that drive it are spread from **one `swapAttrs` object**.
  Two card types disagreeing about which number they offer would look perfectly
  fine on screen.
- **The `href` and the visible digits are rewritten together and must never
  disagree.** The digits are the only thing a visitor can check before tapping.
- Evaluated in **Europe/Athens** via `Intl`, so no offset is hard-coded and DST
  needs no thought. The schedule is passed from `site.hours.entries` rather than
  restated. The decision itself is `isOpenAt` in `src/lib/hours.ts`, so the
  shipped logic is the logic under test. `closes: "00:00"` means the *end* of the
  day; an overnight range (20:00–02:00) is handled but unused.
- **The selector is `[data-phone-swap]`, never a hand-typed id.** An earlier
  version selected `#contact-phone`, which had stopped being rendered; the swap
  silently did nothing and nothing caught it. The attribute belongs on the
  **anchor that dials**, never on the card — on a panel they are the same
  element, on a note card they are not.
- **Verify the open path by editing the schedule, not by waiting**, then revert.
  Restart the preview server and reopen the browser between runs: `astro
  preview` serves a stale `dist/`, and `playwright-cli navigate` re-opens the
  session's stored URL rather than the one passed to it.

**All four photographs carry `alt=""`.** The rule is *is it inside the
control*: everything inside an `<a>` or a `<summary>` is concatenated into the
accessible name, so a descriptive alt would prepend a sentence about a table
setting to the name a screen-reader user hears before placing a call. Card
titles are `<span>`s, not `<h3>`s, for the neighbouring reason. The note's call
link is prefixed with `.sr-only` `contact.phoneLabel`, because bare digits say
nothing out of context (WCAG 2.5.3 wants the visible words inside the name).

**The note cards are `<details>` with no script at all.** A native disclosure
opens, keyboards and announces its state with no JS, and the paragraph is real
DOM throughout. Do not "upgrade" it to a button and `aria-expanded`.

**Text over these photos is safe because of the scrim, not the photos.** Both
images have blown highlights in every third of the frame.

- Verify by hiding the text, screenshotting the rendered panel and sampling
  **every pixel the line occupies — worst single pixel, never the mean.**
- **Sample the hovered state too.** The wash (`::after`) fades out on hover, so
  hovered is the contrast floor and at-rest is the best case. Measuring only at
  rest is how a total failure of the scrim went unnoticed for a revision.
- **The darkening is two layers and only one may move.** `::before` is the
  scrim: it carries the text, it is what the measured ratios describe, and it is
  static. `::after` is the wash, flat, and the thing that animates. Animating the
  scrim walks text contrast to nothing on every hover. **Halve the wash to
  brighten a photograph; touch the scrim only with a pixel scan open.**
- **The gradient stops are lengths (`rem`), not percentages.** The text block is
  a fixed number of pixels tall whatever the card is; a percentage ramp scales
  with the card and pushed the same text into a thinner part of it (3.49:1 at
  390px, a fail at one width only). Re-measure the block and move the stops
  whenever a line is added or removed.
- **The scrim carries two short bold lines and is not a general-purpose text
  background.** Anything longer, smaller or lighter goes on a flat surface
  instead — which is why the note cards put their picture above the copy, and
  why the open card's film is near-opaque.
- The note cards' scrim is shorter than the panels' (6.5rem/12rem vs 8/16) and
  the amount was **measured, not halved**: the Greek title wraps to two lines, so
  the two blocks are the same height. A true halving measured 2.73:1.
- **The card keeps its ratio when open.** Putting the film in flow shrinks it;
  `display: grid` holds the floor but not the ceiling. A card that grew would
  break the uniform 2x2, which is the point of the layout.
- **`left: auto` on the open card's head is load-bearing**, not a way of aligning
  the cue right: the head spans the whole card at `z-index: 4` and swallowed
  every click on the call link, so the tap closed the card instead of dialling. A
  screenshot cannot see this — test with `elementFromPoint` at the badge and at
  the digits, and the answer must be the anchor.
- The cue is **two glyphs swapped by `display`**, not one glyph rotated: a
  chevron turned 90° points *down*, which is what a **closed** disclosure wears.
- The events photograph is a named export in `lib/photos.ts`, not a gallery id,
  because the client did not want it on `/gallery` and `npm run check` would
  report an unlisted file in `gallery/` as unused. Its source is **68% black
  bars** — the real picture is 608x1080 pillarboxed into 16:9, found by pixel
  scan, because the bars are pure black and defeat a threshold crop detector.

## Find Us

The blocks are one column beside the photograph, in the order address →
opening hours → phone → email. The grouping is "where and when" then "how to
reach us", and it is the one thing that has survived every layout this band has
had. Below 55rem the photo stacks under the column, so there is only one order.

- **The breakpoint is 55rem, not the site's usual 48rem**, because
  `.find__hours` is a fixed-width block of rows and needs the room.
- **`.find__media` is sized so it can never read as bigger than the text
  column.** Above the breakpoint it has no `aspect-ratio` and its `<img>` is
  `position: absolute; inset: 0`, so it contributes no height and the row is
  sized by `.find__col` alone. `min-height` is a floor for an edge case, not the
  working height. Below the breakpoint it is an ordinary 4:5 frame.
- **`.find__hours` is `width: fit-content`; 22rem is a ceiling, not the width.**
  A fixed width plus `space-between` is a distributed layout wearing a table's
  clothes: the surplus went into the gap and pinned days and times to their own
  axis while everything above centred on another.
- **The address, phone and email are underlined at rest**, which reverses a
  client request after two rounds of review objected that they read as static
  text. They are the body colour and weight, so colour cannot mark them. **The
  underline goes on the inner `<span>`, never on the anchor** — the anchors are
  `inline-flex` and a decoration on a flex container propagates to its items,
  drawing a line under the icons too.
- **The address IS the map link.** A separate "view on map" button has been
  added and removed twice; the band has no `.btn`. `findUs.viewOnMap` is not a
  dead key — it is `.sr-only` text inside the link, appended rather than an
  `aria-label` so the visible words stay in the accessible name (WCAG 2.5.3).
  The `site.mapUrl` guard stays, so no URL renders plain text rather than a
  control that goes nowhere.
- **`mapUrl` addresses the place by Place ID.** A `/maps/place/…` URL ends in a
  length-prefixed `data=` blob (`!4m6` declares six tokens), so removing a token
  that looks redundant leaves the counts short and Google silently falls back to
  a name search on the wrong pin. It shipped once. If a long place URL is ever
  put back: **paste it whole, never edit it.** Verifying from here is impossible
  (Google 302s to a consent page) — a human clicks it once. `geo` is deliberately
  *not* reconciled with Google's marker; the client supplied it.
- Opening hours render as **contiguous runs**, computed rather than taken from
  each entry's first and last day. A day in `hours.closed` is still listed as
  closed. That array is currently empty (open seven days) — keep the key.
- **There is no "open now" indicator.** One was built and removed. If one comes
  back it must be client-side: a static build bakes in the status as of the last
  deploy, with the real schedule beneath it to contradict.
- The address/phone/email icons are inline SVG in the `SocialLinks` idiom, not
  Font Awesome: the site self-hosts everything, three glyphs do not justify a
  webfont, FA Free's CC BY attribution is unsatisfied here, and inline SVG
  inherits `currentColor`.

## Hero

**The wordmark is the client's logo painted by a CSS mask**, not an `<img>`.
The artwork is white on transparency, so the element's own background is the
colour — recolouring the logo is a token change, not a new asset.

- **The asset is trimmed and that is not tidying.** `LOGO-01.png` is a 4725x4725
  canvas holding a 4725x2770 mark; `mask-size: contain` fits the *file*, so the
  untrimmed asset would leave a third of the box as air. `logo-wordmark.png` is
  the trimmed derivative; `lib/photos.ts` carries the regeneration command.
- **The fill sits behind `@supports`** because the rule fails *open*: a browser
  that paints backgrounds but cannot mask would show a solid stone rectangle.
- `aspect-ratio` is required — a mask contributes no intrinsic size.
- The `h1`'s name comes from `.sr-only` text with the mask span `aria-hidden`.
  The site consequently has **no display type**: nothing is set above
  `--step-3`'s 47px ceiling.

**KNOWN WCAG 2.2.2 FAILURE, accepted by the client.** The slides advance every
3s and never stop. `.hero__pause` was the stop control and was removed on
request. What is left is not a substitute: the `pointerenter`/`focusin` hold
ends when the pointer leaves and a touch visitor has no hover; the dots jump
between slides without stopping the timer; `prefers-reduced-motion` covers the
vestibular case, not control. Shortening the interval does not help — 2.2.2
counts total duration. Restoring compliance means putting a stop control back,
**with its scrim**.

**Anything drawn over a photo needs its own backing, not a tint on the image.**
The hero photos are mid-grey exactly where the controls sit, so the carousel
dashes measure 1.7-2.3:1 — a **recorded trade-off**, reverted from a scrim pill
for the lighter look. It does not extend to other controls: a *position
indicator* can carry this, a control someone must find on every slide cannot.
The lightbox arrows use a two-triangle construction (light arrowhead over a
larger dark one) for the same reason.

## SEO / build

**The production domain is written once, in `site.seo.url`**, and everything
derives from it: `astro.config.mjs` → `Astro.site` → Base's canonical, `og:url`
and `og:image`, plus `@astrojs/sitemap` and `src/pages/robots.txt.ts`. Never
write `fokiaseafoodbar.gr` anywhere else.

It was `https://example.com` for months and nothing caught it — a well-formed
URL, a static build that never throws, and `npm run check` flagging it every run
under "still needed from the client", where it read as a to-do. **A checker line
is not a build failure, and a placeholder indistinguishable from a real value
will be treated as one.** Two consequences:

- **`robots.txt` is an endpoint, not a file in `public/`.** Nothing points at a
  file in `public/` and nothing checks it, so its hard-coded domain went stale
  in silence. Anything in `public/` that needs the domain has this problem.
- **Base's `Astro.site ?? …` fallback names the production domain.** It is
  unreachable and exists only to keep the type `URL`.

**`og:image` is a committed file in `public/` and cannot be an Astro image** — a
social crawler runs no JS and no image pipeline. The URL must be absolute;
Facebook and LinkedIn drop a relative one silently. One card for the whole site
and both locales. It is generated by `npm run og`, which **prints the worst
single pixel behind the mark and warns under 3:1** — re-run it and read the
number if the photograph or the palette moves. The mark is `--salt` there, not
the `--light-stone` the hero uses: on a photograph light stone measured 1.35:1.

Two sharp edges in `sharp`: `composite()` **mutates** the pipeline it is called
on and `clone()` copies the mutation (hence the `photo()` factory), and
`extract` is applied **before** `composite` regardless of call order.

**`NOINDEX=1` keeps preview deployments out of search.** It is an env var
because a static build has no request to read a Host header from. **Both halves
are needed**: `robots.txt` stops the crawl, and only the meta tag stops a
disallowed URL reached from an inbound link being listed without a snippet.
Production sets nothing and is indexable — the safer default to get wrong.

**Three things an SEO review flagged that are correct as they are:** the hero
photographs and the nav logo carry `alt=""` deliberately (the link and the `h1`
already name them); the `Restaurant` JSON-LD does exist on every page, with the
`Menu` graph on `/menu` only; and the language button renders "ENEN" only to a
naive HTML-to-text pass, because `.lang__code` is `display: none`.

Each page needs exactly one `h1`. Nav links to homepage sections must stay
rooted (`/#goal`) so they work from the other three pages.

## TEMP: the concrete ground

`/menu`, `/gallery` and `/team` are under test with a concrete texture
background (`.section--concrete-test` in `global.css`, `--bg-texture` handed in
from each component because the source jpg is 9.3MB and has to go through the
image pipeline). **Not meant to survive in this form.**

- The overlay **lightens** (`--salt` at 28%): the texture's mean luma is 146.6
  and the logo badge's concrete is ~170, so no amount of black could reach it.
- That makes it a light ground, so those pages keep the light tier — except
  `--text-muted`, which is `--black` there: `--stone` measured 1.80:1 at the
  texture's darkest patches.
- **Still outstanding:** `--accent` (`--wood`) is 2.32:1 at the worst patches
  against the 4.5 its small uppercase owes — the team role labels and the menu
  subheads.
- `background-attachment: fixed` ties `cover`'s scaling to the viewport rather
  than to each page's own growing height, so one 2560px source stays sharp. It
  works only because nothing between those sections and the viewport carries a
  `transform`.

## Gotchas

**Layout / CSS**

- `<picture>` must stay `display: contents`. It is inline by default, which
  silently breaks `height: 100%` on the `<img>` inside.
- `<figure>` has a default `margin: 1em 40px`; the reset zeroes it.
- A `<dialog>` must not be given `display` unconditionally. The UA hides a closed
  one with `dialog:not([open]) { display: none }` and **any** author `display`
  beats it — that left a full-viewport block in the page, adding 100dvh.
- Never use `background: currentColor` in a block that also sets `color`: fill
  and text come out identical and the control disappears.
- `border-radius` in a `:focus-visible` rule applies to the *element*, not the
  ring; browsers already follow the element's corners.
- `.section-head p:not(.eyebrow)` — the `:not()` is load-bearing. `.section-head p`
  is (0,1,1) and `.eyebrow` is (0,1,0), so without it an eyebrow renders at
  heading size in the muted tone. That is what made five sections look like they
  had two titles.
- **Selectors drift away from markup silently.** `.menu__legal h3` matched
  nothing for as long as the block has rendered an `<h2>`. Grep the tag, not just
  the class, when a rule looks inert.
- Vertical padding on an inline `<a>` does not grow its row — the stacked nav
  links need `display: block` or the tap targets collapse to ~26px.
- An **image frame's own `background` paints in the anti-aliased fringe of a
  rounded clip**, so on dark ground it must be dark. It needs a large radius, a
  transform and a light background together, and it takes a pixel scan to see —
  one or two pixels on a curve, only while hovered.
- A **`transform` on a child silently reorders painting**: a transformed element
  is painted with positioned descendants at `z-index: auto`, in DOM order, so a
  hovered `<img>` painted over its own scrim. Give every layer in such a card an
  explicit `z-index`.
- An **inset shadow paints before the element's content**, so a ring meant to
  cover an image must go on a pseudo-element above it, not on the element.
- Reproduce fractional-pixel artefacts at the right device scale: launch Chrome
  with `--force-device-scale-factor=1.25`, its own `--remote-debugging-port` and
  `--user-data-dir`, then `npx playwright-cli attach --cdp=http://localhost:<port>`.

**Touch**

- **A rounded control needs `-webkit-tap-highlight-color: transparent` of its
  own**, plus an `:active` state to replace the feedback. Chrome paints the
  site-wide highlight against the border *box* and ignores `border-radius`. It
  cannot be seen with a mouse and does not appear in a screenshot. `.btn`,
  `.lang`, `.contact__panel`, `.contact__note` and `.contact__note-call` opt
  out; **`.menu__tab` and `.menu__jump a` still have the gap**, and fixing them
  is the pair.
- **A `:hover` on a control a touch user will tap must be gated behind
  `@media (hover: hover) and (pointer: fine)`.** A touch browser fakes `:hover`
  on tap and leaves it applied. `pointer: fine` is in the query because a device
  can report both. **`:focus-visible` stays outside the gate** — a keyboard is
  not a pointer — and `:active` is the whole of the touch feedback. Copy
  `.contact__note-call`, which was built with all of this. Still ungated:
  `.nav__links a`, `.social a`, `.menu__tab`, `.menu__jump a`, `.gallery__item`,
  `.btn--primary`, `.find__contact a`, `.find__map`, `.lightbox__arrow`,
  `.lightbox__close`.
- Touch targets are 44px except the documented 32px exceptions (`.lang`,
  `.social a`, the hero dots).
- `theme-color` matches **what the chrome butts against** — the nav (`--black`)
  — not `body`. This has now been wrong in both directions.

**Type**

- Fonts are **static** builds, one file per weight per script. `font-synthesis:
  none` means an unshipped weight is not faked, so adding a weight in CSS means
  adding its files.
- **Manrope ships no italic**, so `font-style: italic` renders as plain upright,
  silently. `.menu__item-wine` carries its distinction with weight 500 instead —
  which matters, because upright it would be identical to `.menu__item-desc`.
- One family; `--font-body` and `--font-display` both resolve to Manrope and stay
  two tokens so a display face could return in one line. Headings are 700 with
  `letter-spacing: -0.02em`.
- Manrope covers Greek — not a given for a geometric sans. Check `unicode.json`
  in the `@fontsource` package before agreeing to any future face.
- The `button` reset does not clear the UA's `padding: 1px 6px`.

**JS / data**

- `{x?.length && <p/>}` renders the text **"0"** when `x` is `[]`. Use a
  ternary. The menu renderers were all three written the unsafe way.
- **`[data-reveal]` blocks are hidden only under `.has-reveal`, and that class is
  added by the inline script in `Base.astro`'s head** — after checking both
  `prefers-reduced-motion` and `IntersectionObserver`. Deliberately inline, not a
  module: a module that failed to load would leave half the homepage at
  `opacity: 0`. **A rule that hides content must be owned by the script that can
  un-hide it.**
- **That observer's `threshold` must stay 0.** A threshold is a fraction of the
  *target's own area*, not the viewport, so a target taller than the screen may
  never reach it — at 0.08, `/team`'s ~2863px list loaded invisible. Use
  `rootMargin` for "properly on screen"; it is height-independent. It cleared 8%
  at a 768px viewport by 0.07 of a point, which is why it tested fine. And check
  whether pixels are *loaded* or merely transparent before touching a loading
  strategy — `getComputedStyle(el).opacity` answers it in one line.
- **Dead-code sweeps need care here**: keys and classes are built at runtime (see
  i18n above), and a docstring claiming a function is used by `npm run check` is
  not evidence — two such functions had the checker carrying its own copy.
  `src/lib/hours.ts` was correctly swept as dead and correctly restored from git
  one change later; the sweep is cheap to undo, guessing the logic twice is not.
- `Plates.astro` and `Goal.astro` pick photos **by id**, not by position, and
  throw at build time if an id is missing.

**Photos**

- **A photo added straight to `src/assets/photos/` never meets the downsample**,
  and nothing in the build complains. `prepare-photos.mjs` reads the SOURCE
  folder outside the repo only. `dsc-9892.jpg` arrived that way at 1836x4080 and
  5.08MB. Apply the script's own treatment by hand — `.rotate()`,
  `resize(2560, 2560, {fit:'inside', withoutEnlargement:true})`,
  `jpeg({quality:88, mozjpeg:true})` — **to a copy, not in place**: doing it in
  place destroyed the only 5MB original, which was untracked.
- **Placeholder data that looks real is invisible to `npm run check`.** The
  opening hours shipped wrong for months behind a `$comment` the walk skipped
  outright, while README called them confirmed. The walk now reports a
  PLACEHOLDER `$comment` when nothing under it trips a rule of its own.

**Verifying**

- Disable Chrome's HTTP cache, force `scroll-behavior: auto` before scrolling to
  trigger lazy images, and clear `localStorage['fokia:lang']` before testing the
  default locale. A clip below the fold needs `captureBeyondViewport: true`. The
  preview server answers on `localhost`, not `127.0.0.1`.
- **Never stop the browser with `taskkill /IM chrome.exe`** — it matches every
  Chrome on the machine, including the user's. Launch with your own
  `--remote-debugging-port` and `--user-data-dir`, record the pid, and stop only
  that; better still, reuse it between rounds.

## Skills

Installed at `~/.claude/skills/` — **user-level, not in this repo**.

| Skill | Use it for |
|---|---|
| `frontend-design` | Aesthetic direction, typography, layout — where this site's look came from |
| `taste-skill` | Anti-templated frontend; overlaps `frontend-design`, pick one per task |
| `web-design-guidelines` | Auditing UI against the Web Interface Guidelines (needs network) |
| `playwright-cli` | Driving a browser to verify a change — prefer it over hand-rolled CDP |
| `image-to-code-skill` | **Written for Codex**; its image-generation workflow will not run here |

`@playwright/cli` is a project devDependency:

```
npx playwright-cli open http://localhost:4321/ --browser chrome
npx playwright-cli screenshot --filename shot.png
npx playwright-cli close
```

`--browser chrome` drives the system Chrome, so no browser download is needed.
Session state lands in `.playwright-cli/`, which is gitignored.

## Reference

Full spec: `C:\Users\KEOGE\seafood-site-prompt.md`.
Approved plan: `C:\Users\KEOGE\.claude\plans\magical-brewing-firefly.md`.
Photo originals (never committed):
`C:\Users\KEOGE\Documents\wetransfer_fokia-reviewed_2026-08-27_1446\`.

Astro docs: [Components](https://docs.astro.build/en/basics/astro-components/) ·
[Images](https://docs.astro.build/en/guides/images/) ·
[Styling](https://docs.astro.build/en/guides/styling/)
