# fokia — seafood bar

Astro marketing site for a Greek seafood restaurant: a scrolling homepage plus
a dedicated `/menu` page. See `README.md`
for how to run it and how a non-developer edits the content.

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

**The light neutral is deliberately cold.** `--salt` is the one colour the client
did not supply, so it is the one that drifts. It is cool on purpose: the photos
were shot on grey concrete and stone, and matching them sets the photography into
the page. A warm cream also drags `--wood` toward terracotta, which is the wrong
read — the shopfront sign in the team photos is rusted metal. `--wood-light` and
`--wood-pale` lighten Wood along that oxidation path, dusty and pink, never
toward orange. Warming any of these four back up undoes the palette.

**Controls that only work with JS live in a `<template>`.** The hero carousel
arrows and dots are cloned from `#hero-controls-template` at runtime, and the
gallery lightbox from `#lightbox-template`, so a visitor without JS is never
shown a button that does nothing. The gallery *tiles* are exempt and stay in the
page: each is an `<a>` pointing at the full-size photo, so it still goes
somewhere real when the script does not run, and JS only intercepts the click. Never build such a
control's label as a string inside the script: render it with `t(locale, …)` in
the template and keep `data-i18n-label` on it, or the language switch cannot
reach it. A label that counts something also needs `data-i18n-n`, which is what
fills the `{n}` in `a11y.heroGoTo`.

**Three pages.** `/` is the scrolling homepage; `/menu` is the menu and its
legal block; `/gallery` is the photographs. Nav links to homepage sections must
stay rooted (`/#team`) so they work from the other two. The `Restaurant` JSON-LD
lives on `/` with `hasMenu` pointing at `/menu`; the `Menu` graph is emitted
only on `/menu` via Base's `menuSchema` prop. Each page needs exactly one `h1`
— which is why Gallery's heading is an `h1`, not the `h2` it was as a section.

## Commands

```
npm run dev      # dev server
npm run build    # production build into dist/
npm run check    # content validation + what is still missing from the client
npx astro check  # type check (should stay at 0 errors)
npm run photos   # re-run the one-time photo downsample (only for new originals)
npm run favicons # regenerate favicons from the logo (only if the logo changes)
```

`npm run check` compares i18n *keys*, not values: it will not notice an
English string sitting in `el.json`. That has already happened once, by
accident. Read the diff on a locale file. The one deliberate exception is
`footer.rights`, which the client asked to be the same English line in both
locales — leave it alone; `el.json`'s `$comment` says so too.

Node is installed but **not on the shell PATH**; prepend it first:
`$env:Path = "$env:ProgramFiles\nodejs;" + $env:Path`

## Gotchas hit while building this

- `<picture>` must stay `display: contents` (set in `global.css`). It is inline by
  default, which silently breaks `height: 100%` on the `<img>` inside it.
- `<figure>` has a default `margin: 1em 40px`; the reset zeroes it. Without that,
  gallery images render narrower than their column.
- Reordering an alternating grid row needs the **track sizes swapped too**, not
  just `order` — otherwise the portrait lands in the wide column.
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
  The bar still collapses at 64rem. Measured clearance at 1025px is 62px in
  Greek — "Κλείστε τη θέση σας • Take away" is the longest label and Greek is
  the longer set overall, so it is Greek that decides the fit, not English.
  There is very little slack left: lengthening any label means re-measuring at
  1025px before trusting it.
- Anything drawn over the hero photos needs its own scrim, not a tint of
  `--salt` on the image. The photos are mid-grey exactly where the controls
  sit, so the old carousel dashes measured 1.7-2.3:1 against them — under the
  3:1 WCAG minimum for a control, on every slide. The pill behind the arrows
  and dots holds 4.5:1 even over a blown-out white photo.
- Vertical padding on an inline `<a>` does not grow its row. The stacked mobile
  nav links need `display: block` or the tap targets collapse to ~26px.
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

## Reference

Full spec: `C:\Users\KEOGE\seafood-site-prompt.md`.
Approved plan: `C:\Users\KEOGE\.claude\plans\magical-brewing-firefly.md`.
Photo originals (never committed):
`C:\Users\KEOGE\Documents\wetransfer_fokia-reviewed_2026-08-27_1446\`.

## Astro docs

- [Components](https://docs.astro.build/en/basics/astro-components/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Styling](https://docs.astro.build/en/guides/styling/)
