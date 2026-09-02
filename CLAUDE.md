# fokia — seafood bar

Astro marketing site for a Greek seafood restaurant: a scrolling homepage plus
dedicated `/menu` and `/gallery` pages. See `README.md` for how to run it and
how a non-developer edits the content.

## Rules that are easy to break

**The menu is never translated.** Dish names, descriptions and category names in
`src/data/menu-food.json` and `menu-drinks.json` are flat Greek strings that
render identically in both locales. Some are natively English or mixed ("Tuna
tataki με jalapeño sauce") — render verbatim, never transliterate. The `#menu`
section keeps `lang="el"` on the English page. Site *chrome* is bilingual and
lives in `src/i18n/{el,en}.json`.

**The menu content is real client data.** Never invent a dish, a price, or an
English translation of one. Nine items have `"price": null` because the client
has not priced them; they must still render, with an em dash.

**The legal block is legally required.** `src/data/legal.json` always renders
under the menu, never collapsed, never shortened.

**Content changes go in JSON, not components.** `src/data/` and `src/i18n/` only.

**Update `README.md` and `CLAUDE.md` in the same change, not afterwards.** They
are the only description of *why* this site is the way it is, and every rule and
gotcha below was written because someone had already been caught by it. When you
change behaviour, structure, tokens, copy or the content model, update the docs
in the same pass.

- `README.md` is for the person editing content and deploying: what to edit,
  what the numbers are, what is still outstanding before launch.
- `CLAUDE.md` is for whoever works on the code next: rules that are easy to
  break, and gotchas that cost time once already.
- `AGENTS.md` is a byte-identical copy of `CLAUDE.md`. Edit `CLAUDE.md`, then
  `cp CLAUDE.md AGENTS.md` — never hand-edit both, they drift.

Check the claim before writing it down. Several notes in here went stale because
the code moved and the prose did not: measured figures (contrast ratios, nav
clearance, page weights) should be re-measured, not copied forward, and a removed
feature means removing its rule too.

**The light neutral is deliberately cold.** `--salt` is the one colour the client
did not supply, so it is the one that drifts. It is cool on purpose: the photos
were shot on grey concrete and stone, and matching them sets the photography into
the page. A warm cream also drags `--wood` toward terracotta, which is the wrong
read — the shopfront sign in the team photos is rusted metal. `--wood-light` and
`--wood-pale` lighten Wood along that oxidation path, dusty and pink, never
toward orange. Warming any of these four back up undoes the palette.

**No two bands in a row share a background.** The page steps light / mid / dark
and back: Hero black, Our Goal stone, Team salt, From the kitchen black, Take
away salt, Find Us stone, footer black. Our Goal is on the mid tier *because*
the hero above it is black — as a dark section it ran straight into the hero with
no boundary.

**The nav is the one thing exempt from that, and it pays for the exemption with
an edge.** It is black, and being sticky it cannot re-tier itself the way Our
Goal did — it passes over all three black bands (Hero, From the kitchen, the
footer) and would merge with each in turn. What keeps it a bar is
`border-bottom: 1px solid var(--rule)`, which on the bar's own dark tokens is
Light Stone at 30%: the only thing between the bar and the hero directly beneath
it, both `--black`. Removing that hairline does not look like removing a border,
it looks like the nav disappearing into the hero. Do not "tidy" it.

The tiers are a consequence of the order, not a property of each section, and
moving one re-tiers its neighbours. When From the kitchen moved below Team it
landed directly above Take away and both were black. Of the two, **the
photographs keep the dark ground and the text-only band gives way**: food needs
black and has nowhere else to go, while a heading and a phone number read on any
tier — which is the same logic that put Our Goal and Find Us on stone. So Take
away is now a light band. Work the sequence out in full before changing an
order; there are only three tiers and both ends are pinned black.

**Each section on the homepage uses a different layout.** Hero is a split, Our
Goal is two columns of text, Team is a portrait grid, From the kitchen is a
staggered photo row, Take away is a heading against a number, Find Us is a text
and image split. That is deliberate and it is recent: Team used to be four
alternating photo-and-paragraph rows and Find Us is a fifth of the same shape, so
the page ran the identical composition five times and spent 45% of its height
doing it. Find Us is now the only image-and-text split left. Before adding a
section, check what shape its neighbours already are.

**From the kitchen is not in the nav — but the width argument that used to
forbid it is gone, so do not repeat it.** It said "cannot be", and that was
true while the bar collapsed at 64rem: a seventh Greek label cost ~133px against
70px of clearance at 1025px and pushed the bar to a 1080px scroll width.

Moving the collapse to 75rem for the logo changed the answer. Re-tested at
1201px by cloning a label in: it costs 117px, clearance goes 150px → 24px, and
`scrollWidth` stays at 1201. **It fits.** So the band is out of the nav as a
content decision — it is reached by scrolling and its own button goes to
`/gallery` — not because the bar has no room.

24px is not room to spend casually, though, and 117px is a guess at copy that
does not exist yet. Measure with the real label before adding one. And measure
`document.documentElement.scrollWidth`, not the gap: `.nav__utils` does not
shrink, so an overrun shows up as the whole bar running past the viewport while
the clearance reading stays positive — which is exactly how the old test read at
1025px.

**Controls that only work with JS live in a `<template>`.** The hero carousel
controls are cloned from `#hero-controls-template` at runtime, and the gallery
lightbox from `#lightbox-template`, so a visitor without JS is never shown a
button that does nothing. The hero has no prev/next arrows — they were added and
then reverted to the original bare dashes; see the trade-off note on
`.hero__dots` in `global.css`. Never build such a control's label as a string
inside the script: render it with `t(locale, …)` in the template and keep
`data-i18n-label` on it, or the language switch cannot reach it. A label that
counts something also needs `data-i18n-n`, which is what fills the `{n}` in
`a11y.heroGoTo`.

**A cloned control must be handed to `window.fokiaI18n` or its labels stay
Greek.** Template content is a separate document fragment, so the language
switcher's `document.querySelectorAll` pass never sees inside it — and that pass
has already run by the time an ES-module section script clones anything. For
about as long as the templates have existed, a visitor on English got Greek
labels on all four hero dots and every lightbox control. Base's inline script now
exposes two methods, and both section scripts call the first one immediately
after putting the clone in the page:

- `refresh()` — re-apply the current locale over the whole document, clones
  included. Call it right after `append`.
- `setLabelKey(el, key)` — for a control whose label changes with its *state*
  (the nav toggle, the hero stop button). The script picks the key; the string
  still comes from the dictionary, so the switch keeps working on it afterwards.
  This is the only sanctioned way for a script to change an `aria-label`.

Both are called with `?.` — the section scripts are modules and run after the
inline one, but a control still has to work if it never loaded. The type lives in
`src/env.d.ts`.

**The hero carousel needs a stop button, and hover is not it.** WCAG 2.2.2: the
slides advance every 6s, so there must be a mechanism to stop them. Holding on
`pointerenter`/`focusin` is a convenience, not the mechanism — a touch visitor
has no hover and the hold ends the moment the pointer leaves. `.hero__pause`
(bottom-right of the hero, its own `<template>` child) is the real one, and it
keeps two separate flags: `hovering` is the transient hold, `stopped` is the
button. `start()` bails on either, so hover can never restart something the
visitor stopped. Under `prefers-reduced-motion` the whole block is skipped, which
is why there is no button to find there — there is also no motion.

The gallery *tiles* are the deliberate exception and stay in the page: each is an
`<a>` pointing at the full-size photo, so it still goes somewhere real when the
script does not run, and JS only intercepts the click.

**Scroll-snap is `proximity`, and making it `mandatory` breaks the page.** The
bands are not viewport-sized and cannot be. Measured at 1366x768: Plates 834,
Team 1030, Find Us 1082 are all taller than the screen; on a 390x844 phone Team
is 2961, three and a half viewports; Take away is 232, about a quarter of one.
`mandatory` pulls the reader out of a band they are still reading and gives the
short band a whole screen for two lines. `proximity` only settles a scroll that
already ended near a boundary, so tall bands scroll through normally. Snapping is
gated at 48rem (below it there is nothing to settle onto) and on
`prefers-reduced-motion` (it moves the page without being asked). This is also
why full scroll-hijacking — one wheel tick per section — is not on the table:
it would hide the bottom of Team and Find Us and break every `/#anchor` in the
nav.

**A rule that hides content must be owned by the script that can un-hide it.**
`[data-reveal]` blocks are invisible only under `.has-reveal`, and that class is
added by the inline script in `Base.astro`'s head — which adds it *after*
checking both `prefers-reduced-motion` and `IntersectionObserver`, and which
collects its targets on `DOMContentLoaded` in the same script. Deliberately one
inline script, not a deferred module: a module that failed to load would leave
half the homepage at `opacity: 0` with nothing left to reveal it. Inline also
means the class lands before first paint, so nothing shows and then hides. Keep
that contract if you add reveal targets — never add `.has-reveal` from anywhere
else.

**Section eyebrows were a bug, not a device.** Every section used to render one
from its `nav.*` key, which in five of six cases was the heading verbatim — two
identical titles stacked. Only Our Goal keeps one, because its heading is a
sentence and the eyebrow is the only thing naming the section. Do not add them
back per-section without new copy that says something the heading does not.

**Three pages.** `/` is the scrolling homepage; `/menu` is the menu and its
legal block; `/gallery` is the photographs. Nav links to homepage sections must
stay rooted (`/#team`) so they work from the other two. The `Restaurant` JSON-LD
lives on `/` with `hasMenu` pointing at `/menu`; the `Menu` graph is emitted
only on `/menu` via Base's `menuSchema` prop. Each page needs exactly one `h1`
— Gallery's heading is an `h1`, and on the homepage the `h1` is the hero *logo
image*, so its `alt` is what gives that heading its accessible name. Do not
strip the alt.

## Commands

```
npm run dev      # dev server
npm run build    # production build into dist/
npm run preview  # serve dist/ on :4321 (astro preview stop / status / logs)
npm run check    # content validation + what is still missing from the client
npx astro check  # type check (should stay at 0 errors)
npm run photos   # re-run the one-time photo downsample (only for new originals)
npm run favicons # regenerate favicons from logo-clean.png (only if it changes)
```

`npm run check` compares i18n *keys*, not values: it will not notice an
English string sitting in `el.json`. That has already happened once, by
accident. Read the diff on a locale file. The one deliberate exception is
`footer.rights`, which the client asked to be the same English line in both
locales — leave it alone; `el.json`'s `$comment` says so too.

Node is installed but **not on the shell PATH**; prepend it first:
`$env:Path = "$env:ProgramFiles\nodejs;" + $env:Path`

## Gotchas hit while building this

- Fonts are **static** builds, one file per weight per script, not variable.
  Google's variable fonts are unhinted and looked blocky on Windows. The site
  renders exactly Open Sans 400/500/600 + 400 italic and Noto Serif 600, and
  only those ship. `font-synthesis-weight: none` means an unshipped weight is not
  faked — it falls back — so adding a weight in CSS means adding its files too.
- `<picture>` must stay `display: contents` (set in `global.css`). It is inline by
  default, which silently breaks `height: 100%` on the `<img>` inside it.
- `<figure>` has a default `margin: 1em 40px`; the reset zeroes it. Without that,
  gallery images render narrower than their column.
- Team is a **portrait grid**, not alternating rows, and the section is sized to
  stay that way: `.team__name` is one step down from a full-width row's heading
  and the bio renders at `--step--1` because the column is ~285px, not half a
  page. A fifth and sixth member fill the second row rather than adding another
  screen and a half. The old layout's gotcha — that reordering an alternating row
  needs the track sizes swapped as well as `order`, or the portrait lands in the
  wide column — went with it.
- `.section-head p:not(.eyebrow)` — the `:not()` is load-bearing. `.section-head p`
  is (0,1,1) and `.eyebrow` is (0,1,0), so without it the paragraph rule wins and
  an eyebrow inside a section head silently renders at heading size in the muted
  tone instead of small in the accent. That is what made five sections look like
  they had two titles rather than a label and a title.
- A `<dialog>` must not be given `display` unconditionally. The UA hides a closed
  one with `dialog:not([open]) { display: none }`, and **any** author `display`
  beats it — declaring it on `.lightbox` itself left a full-viewport dark block
  in the page after the footer, adding 100dvh to the document. It goes on
  `.lightbox[open]`.
- Never use `background: currentColor` in a block that also sets `color`.
  `currentColor` resolves against that element's own computed `color`, so the
  fill and the text come out identical and the control disappears. Ghost buttons
  use the explicit `--ghost-hover-bg` / `--ghost-hover-fg` tokens instead.
- Colours on a section come from tokens the surface tier sets (`--accent`,
  `--text-muted`, `--ghost-hover-*`). Don't reference `--wood` directly for
  text: it is 2.3:1 on Deep Black and 1.3:1 on Stone.
- The nav is logo, links, utilities — three items in flow, nothing positioned.
  The bar once centred a logo *absolutely*, which is why the links were split
  into two balanced groups; the logo is back but it is in flow at the start, so
  it only costs the row its own width and the links stay a single list.
  `.nav__inner` has no `justify-content` — with three children that would push
  the links into the middle — and `margin-inline-start: auto` on `.nav__utils`
  does the pushing instead.

  **The bar collapses at 75rem, not 64rem, and the logo is why.** Clearance at
  1025px was 70px in Greek; the logo spends 48px of that plus the row's 24px gap
  — 72px against 70px — so the full bar stopped fitting at the old breakpoint
  and hands over to the toggle sooner. Measured at 1201px, the first width above
  the new breakpoint, clearance is **146px** and `scrollWidth` equals the
  viewport. Re-measure at 1201px, not at 1025px.

  History worth keeping, because the figure has moved three times and each move
  was a different cause: 62px, until the social icons went 2.15rem → 2.75rem for
  the touch target and spent 19px; 43px, until `--font-body` went Inter →
  Open Sans, the narrower face, which gave 27px back (Inter set those six Greek
  labels 29px wider in total, measured on a canvas at the nav's own size); 70px,
  until the logo took 72px and moved the breakpoint instead. "Κλείστε τη θέση
  σας • Take away" is still the longest label and Greek is still the longer set,
  so Greek decides the fit, not English. The language pill was given
  `min-height` only, not padding, for exactly this reason — it buys the 44px
  without costing the row any width.

- **The nav is a dark surface inside the light tier, so it carries the dark
  tier's tokens itself.** `.nav` sets `--text`, `--text-muted`, `--accent`,
  `--ghost-hover-*` and `--rule` the same way `.section-dark` and `.lightbox` do.
  Painting the background black without them leaves the links at `--stone` and
  the hover at `--wood` (2.3:1 on Deep Black) — the background is the easy half.
  Measured on the rendered bar: links, social icons and the inactive language
  button are all 6.55:1, the active pill's fill is 6.42:1 against the bar.

  That pill is the one place a Wood tint is used as a *surface* rather than as
  text, and the bar going black moved which tint is correct: `--wood` filled it
  at 6.6:1 against the old salt bar and at **2.2:1** against Deep Black, where
  the selected language stopped reading as selected. It is `--wood-light` with a
  `--black` label now. If the bar ever goes light again, that goes back too.
- Anything drawn over a photo needs its own backing, not a tint on the image.
  The hero photos are mid-grey exactly where the controls sit, so the carousel
  dashes measure 1.7-2.3:1 against them — under the 3:1 WCAG minimum for a
  control, on every slide. That one is a **recorded trade-off**: the dashes were
  given a scrim pill and it was reverted for the lighter look, so they stay as
  they are. It does not extend to the other two controls over those photos.
  `.hero__pause` carries the scrim (same construction as `.lightbox__close`)
  because it is the control that *stops* the motion and has to be findable on
  every slide; the lightbox arrows use the reference gallery's two-triangle
  construction, a light arrowhead over a larger dark one, which does the same
  job. If the dashes' contrast is ever raised, put the surface back rather than
  only darkening the dash — the photo underneath changes on every slide.
- A `<dialog>` appended to `<body>` inherits the **light** tier's tokens, not
  the dark surface it paints itself. `:focus-visible` draws its ring in
  `--accent`, which meant the lightbox's focus indicator was `--wood` at 2.3:1
  against its own near-black scrim. `.lightbox` sets `--accent: var(--wood-light)`
  for itself. Anything else moved out to the body needs the same treatment.
- `{x?.length && <p/>}` renders the text **"0"** when `x` is `[]`. `undefined`
  short-circuits to nothing, so this only shows up on data the client can
  actually produce — emptying a category's `items` in the JSON. Use a ternary.
  The menu renderers were all three written the unsafe way.
- `border-radius` in the `:focus-visible` rule applies to the *element*, not to
  the ring; browsers already follow the element's own corners. It was rounding
  whatever had focus, most visibly the square gallery tiles.
- The `button` reset does not clear the UA's `padding: 1px 6px`. A carousel dash
  set to `width: 100%` inside a 2rem button is therefore 20px, not 32px — worth
  knowing before "fixing" a measurement that looks 12px short.
- **The collapsed bar has its own width budget, and it is measured at 320px.**
  It holds logo + utilities + toggle, which wants 297px against the 280px the
  wrap leaves at 320px, so the toggle wrapped onto a second row. The bar did
  *not* get taller when it did — two stacked ~44px rows still fit inside the
  6rem min-height — so the only symptom was the toggle sitting under the logo,
  which is easy to miss and was shipped once. Measure the toggle's `top` against
  the logo's `bottom`; neither the bar's height nor `scrollWidth` will tell you.

  The `max-width: 22.5rem` block buys the 17px back out of spacing only: the
  row's column gap, `.nav__utils`'s gap, and the language pill's horizontal
  padding. Budget after it is 264px against 280px. No target shrinks — the
  social icons keep their 2.75rem box and the language buttons keep their
  `min-height`, so both stay 44px tall (the pill narrows from 35px to 28px wide,
  still over the 24px floor and still a contiguous row). The logo stays 3rem
  because it is the one thing in that bar meant to be looked at.

  **It still wraps below ~305px** (a 280px Galaxy Fold cover screen, say). The
  remaining 24px can only come out of the two 44px social targets, which is a
  deliberate decision documented below — so that is a trade to make on purpose,
  not a bug to quietly fix.
- Touch targets are 44px, and the hero dots are the one deliberate exception:
  the box is 2rem wide because `::after` is `width: 100%`, so widening the target
  widens the dash and spreads the strip, which is the whole of that control's
  design. They are 2rem × 2.75rem — over the 24px WCAG 2.5.8 floor, and adjacent,
  so the row is one continuous target. When the hit box grew, `.hero__dots`
  `bottom` dropped from 1.25rem to 0.875rem to leave the dashes on the same line.
- `theme-color` is the **nav** (`--black`), and this one has now been correct in
  both directions. It paints the browser's own chrome and the overscroll gutter.
  While the bar was translucent salt, a black value stranded a dark strip above
  a light page on every route except the top of the homepage — so it was salt.
  The bar going black inverts that exactly: salt now strands a *light* strip
  above a black bar, everywhere, at every scroll position. Both ends of the
  document are black (bar above, footer below), so the gutter agrees at both.
  The rule is "match what the chrome actually butts against", not "match
  `body`" — and what it butts against is the sticky bar.
- Selectors drift away from the markup silently. `.menu__legal h3` matched
  nothing for as long as the block has rendered an `<h2>`, which left the one
  legally required heading on the site at default Garamond `h2` size instead of
  the small uppercase label it is written to be. Grep the tag, not just the
  class, when a rule looks like it is not doing anything.
- Opening hours are rendered as *contiguous* runs of days, not each entry's first
  and last. An entry listing Tuesday and Thursday must not render "Tue – Thu" and
  claim a Wednesday the restaurant is shut. Non-contiguous days become separate
  rows. Monday is listed as closed on purpose: it is not a working hour, but
  dropping it leaves a visitor guessing.
- **Placeholder data that looks real is invisible to `npm run check`.** The
  opening hours shipped wrong for months: `site.json` held invented times whose
  only warning was the word PLACEHOLDER inside `hours.$comment`, and
  `outstandingSiteFields` skipped every `$`-prefixed key outright — so the
  checker never mentioned them, while README had already listed them under
  "confirmed and in place". The walk now reports a PLACEHOLDER `$comment` when
  nothing under it trips a rule of its own, which is precisely that case and
  stays quiet where the data already flags itself (geo's nulls, seo's example
  domain). The wider lesson is the one at the top of this file: check the claim
  before writing it down, in both directions — README asserting something is
  confirmed does not make the JSON agree.
- `scroll-padding-top` on the container and `scroll-margin-top` on the target
  **both** apply and they stack. The site carried both for the sticky nav, so an
  anchor jump landed a section 180px down a viewport whose nav was 81px tall
  (100 + 80), and a menu jump chip landed a category at 208px (100 + 108) — a
  fat empty band under the bar on every jump, which nobody had measured. Only
  `scroll-padding-top` on `<html>` survives; it covers anchors, focus scrolling
  and snapping in one place. If a jump target ever looks wrongly offset, check
  whether something has reintroduced a `scroll-margin-top` on top of it.

  **It is paired with the bar's height and the two move together.** The bar is
  `min-height: 6rem` + 1px of border = 97px, and `scroll-padding-top: 7.25rem`
  (116px) leaves 19px of air under it — the same air the old 81px bar had at
  6.25rem. Verified by jumping to `/#team`: the bar's bottom is at 97px and the
  section lands at 116px. Change one without the other and every anchored
  heading goes behind the bar, or sits in a band of nothing.
- Vertical padding on an inline `<a>` does not grow its row. The stacked mobile
  nav links need `display: block` or the tap targets collapse to ~26px.
- `.section--tight` exists for a band whose content is a heading and a line or
  two (Take away). The full `--section-y` is sized for sections with a grid or a
  photo set under the heading; on a short one it reads as a gap. Padding was only
  half the problem there: stacked, the whole section sat in the left third of a
  full-width black band with the rest of the row empty. `.contact__inner` sets
  the heading against the number on one line from 48rem up, which is what
  actually made it read as a band.
- `Plates.astro` picks its four photos **by id**, not by taking the first four in
  `gallery.json`. The gallery is ordered for the gallery — room, sign, drinks and
  plates interleaved — so position is not a stable way to ask for "the food", and
  reordering that file would otherwise silently change the homepage. It throws at
  build time if an id is missing rather than rendering a gap.
- `logo-clean.png` is the only logo file. It carries the hero, the nav and the
  footer, and the favicons are generated from it. The measured geometry: the
  canvas is **1672×940**, the badge inside it is **888×899** — near enough square
  — with 393px of transparent field to its left and 391px to its right. So it is
  horizontally centred, and 47% of the file's width is empty.

  That is why anything sizing it by **height** pays for the field: at 56px tall
  the file wants 93px of width to show a 56px mark. `prepare-favicons.mjs` deals
  with it by trimming to the badge and normalising to 512×512 before cropping —
  every box in that script is measured against the normalised square, not the
  file's own pixels.

  **The nav deals with it without a second asset.** `.nav__logo` is a square box
  with `object-fit: cover`, which shows the central 940px of the source — the
  whole 888px badge with 26px to spare each side. The field is cropped away for
  free, the mark fills the box, and the bar reuses the asset the hero has already
  loaded instead of a trimmed copy that would need regenerating whenever the logo
  changes. This works *because* the badge is horizontally centred; a replacement
  logo that is off-centre will crop wrong, silently, and look like sloppy
  cropping rather than like a geometry change. Re-measure before trusting it.
- When screenshotting to verify, disable Chrome's HTTP cache, force
  `scroll-behavior: auto` before scrolling to trigger lazy images, and clear
  `localStorage['fokia:lang']` before testing the default locale. A clip whose
  page coordinates fall below the fold silently captures the wrong region unless
  `captureBeyondViewport: true` goes with it. The preview server answers on
  `localhost`, not `127.0.0.1`.
- **Never stop the browser with `taskkill /IM chrome.exe`.** That matches every
  `chrome.exe` on the machine, including the ones the person at the keyboard has
  open, and one headless instance is ~40 processes so the count tells you
  nothing. Launch verification Chrome with its own `--remote-debugging-port` and
  `--user-data-dir`, record the pid, and stop only that — `Browser.close` over
  its own port, or `taskkill //PID <pid> //T //F`. Better still, leave it running
  and reuse it between rounds.

## Skills

Installed at `~/.claude/skills/` — **user-level, not in this repo**, so a fresh
clone does not get them. Listed here so it is clear which ones apply to this
project and which do not.

| Skill | Use it for | Notes |
|---|---|---|
| `frontend-design` | Aesthetic direction, typography, layout | The one this site's look came from |
| `taste-skill` | Anti-templated frontend, redesigns | Overlaps `frontend-design`; pick one per task rather than both |
| `web-design-guidelines` | Auditing UI against the Web Interface Guidelines | Fetches the rules at runtime, so it needs network |
| `playwright-cli` | Driving a browser to verify a change | See below — prefer it over hand-rolled CDP |
| `image-to-code-skill` | — | **Written for Codex.** Its core directive is to generate design images first, which Claude Code cannot do. Installed, but its main workflow will not run here. |

`@playwright/cli` is also a project devDependency, so that part *is* committed.
Use it instead of hand-writing CDP WebSocket scripts, which is how every
screenshot in this project's history was taken:

```
npx playwright-cli open http://localhost:4321/ --browser chrome
npx playwright-cli screenshot --filename shot.png
npx playwright-cli close
```

`--browser chrome` drives the system Chrome, so no 150 MB browser download is
needed. Session state lands in `.playwright-cli/`, which is gitignored. The
warning below about never killing Chrome by image name still applies.

## Reference

Full spec: `C:\Users\KEOGE\seafood-site-prompt.md`.
Approved plan: `C:\Users\KEOGE\.claude\plans\magical-brewing-firefly.md`.
Photo originals (never committed):
`C:\Users\KEOGE\Documents\wetransfer_fokia-reviewed_2026-08-27_1446\`.

## Astro docs

- [Components](https://docs.astro.build/en/basics/astro-components/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Styling](https://docs.astro.build/en/guides/styling/)
