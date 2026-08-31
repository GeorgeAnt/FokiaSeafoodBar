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
and back: Hero black, Our Goal stone, Team salt, Take away black, Find Us stone,
footer black. Our Goal is on the mid tier *because* the hero above it is black —
as a dark section it ran straight into the hero with no boundary. Stone carries
the two text-only sections, which is what suits a mid grey: neither has
photographs sitting on it. Changing any section's tier means checking its
neighbours.

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
  renders exactly Inter 400/500/600 + 400 italic and EB Garamond 600, and only
  those ship. `font-synthesis-weight: none` means an unshipped weight is not
  faked — it falls back — so adding a weight in CSS means adding its files too.
- `<picture>` must stay `display: contents` (set in `global.css`). It is inline by
  default, which silently breaks `height: 100%` on the `<img>` inside it.
- `<figure>` has a default `margin: 1em 40px`; the reset zeroes it. Without that,
  gallery images render narrower than their column.
- Reordering an alternating grid row needs the **track sizes swapped too**, not
  just `order` — otherwise the portrait lands in the wide column. (Team,
  `.team__member:nth-child(even)`.)
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
- The nav has no logo and nothing out of flow: one list of links at one end,
  the social icons and the language switch at the other. The old bar centred a
  logo absolutely, which is why the links used to be split into two balanced
  groups — that constraint is gone, so links can be added to the single list.
  The bar still collapses at 64rem. Measured clearance at 1025px is **43px** in
  Greek — "Κλείστε τη θέση σας • Take away" is the longest label and Greek is
  the longer set overall, so it is Greek that decides the fit, not English. It
  was 62px until the social icons went from 2.15rem to 2.75rem for the touch
  target, which spent 19px of it. There is very little slack left: lengthening
  any label, or widening anything in `.nav__utils`, means re-measuring at 1025px
  before trusting it. The language pill was given `min-height` only, not padding,
  for exactly this reason — it buys the 44px without costing the row any width.
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
- Touch targets are 44px, and the hero dots are the one deliberate exception:
  the box is 2rem wide because `::after` is `width: 100%`, so widening the target
  widens the dash and spreads the strip, which is the whole of that control's
  design. They are 2rem × 2.75rem — over the 24px WCAG 2.5.8 floor, and adjacent,
  so the row is one continuous target. When the hit box grew, `.hero__dots`
  `bottom` dropped from 1.25rem to 0.875rem to leave the dashes on the same line.
- `theme-color` is the page background (`--salt`), not the hero. It paints the
  browser's own chrome and the overscroll gutter, which sit against `body` — the
  black it used to carry put a dark bar above a light page everywhere except the
  very top of the homepage.
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
- Vertical padding on an inline `<a>` does not grow its row. The stacked mobile
  nav links need `display: block` or the tap targets collapse to ~26px.
- `.section--tight` exists for a band whose content is a heading and a line or
  two (Take away). The full `--section-y` is sized for sections with a grid or a
  photo set under the heading; on a short one it reads as a gap.
- `logo-clean.png` is the only logo file. It carries the hero and the footer, and
  the favicons are generated from it. The badge sits centred in a wide
  transparent field, so anything using it sizes by **height**, and
  `prepare-favicons.mjs` trims to the badge and normalises to 512×512 before
  cropping — every box in that script is measured against the normalised square,
  not the file's own pixels.
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
