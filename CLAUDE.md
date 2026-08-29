# fokia — seafood bar

Single-page Astro marketing site for a Greek seafood restaurant. See `README.md`
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

## Commands

```
npm run dev      # dev server
npm run build    # production build into dist/
npm run check    # content validation + what is still missing from the client
npx astro check  # type check (should stay at 0 errors)
npm run photos   # re-run the one-time photo downsample (only for new originals)
```

Node is installed but **not on the shell PATH**; prepend it first:
`$env:Path = "$env:ProgramFiles\nodejs;" + $env:Path`

## Gotchas hit while building this

- `<picture>` must stay `display: contents` (set in `global.css`). It is inline by
  default, which silently breaks `height: 100%` on the `<img>` inside it.
- `<figure>` has a default `margin: 1em 40px`; the reset zeroes it. Without that,
  gallery images render narrower than their column.
- Reordering an alternating grid row needs the **track sizes swapped too**, not
  just `order` — otherwise the portrait lands in the wide column.
- When screenshotting to verify, disable Chrome's HTTP cache, force
  `scroll-behavior: auto` before scrolling to trigger lazy images, and clear
  `localStorage['fokia:lang']` before testing the default locale.

## Reference

Full spec: `C:\Users\KEOGE\seafood-site-prompt.md`.
Approved plan: `C:\Users\KEOGE\.claude\plans\magical-brewing-firefly.md`.
Photo originals (never committed):
`C:\Users\KEOGE\Documents\wetransfer_fokia-reviewed_2026-08-27_1446\`.

## Astro docs

- [Components](https://docs.astro.build/en/basics/astro-components/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Styling](https://docs.astro.build/en/guides/styling/)
