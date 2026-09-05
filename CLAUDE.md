# fokia — seafood bar

Astro marketing site for a Greek seafood restaurant: a scrolling homepage plus
dedicated `/menu` and `/gallery` pages. See `README.md` for how to run it and
how a non-developer edits the content.

## Rules that are easy to break

**The menu is bilingual now — it used to be the one thing on the site that
wasn't.** `name`, `description`, `unit`, `variants` and the `wine` fields in
`src/data/menu-food.json` and `menu-drinks.json` are locale-keyed
(`{ "el": "…", "en": "…" }`), the same shape `team.json` uses for a person's
bio, and flow through the same mechanism in `src/lib/i18n.ts`
(`menuGroupKeys`) that the rest of the site's content keys do. `el` is the
client's menu exactly as printed and is the source of truth; `en` is a
translation of it, never a different dish. `volume` (`"250 ml"`) stays a plain
string — it reads the same in either language.

A unit or category name the client had written as a dual literal before the
site was bilingual — `"6 τεμάχια | 6 pieces"`, `"Νερό | Water"` — is **split**
across locales like any other field (`el: "6 τεμάχια"`, `en: "6 pieces"`), not
carried over as one string in both. The "|" was how the client wrote a
bilingual label before the site had a translation mechanism of its own; it is
not a separator worth preserving now that one exists.

Some strings genuinely are identical across both locales rather than
translated, and that is not a bug:

- A dish or drink name that is already English or a brand ("Tuna tacos", "Bao
  buns", "Nikka Whisky From The Barrel") — render verbatim in both, never
  transliterate.
- Wine producer/label names ("Κτήμα Ζαφειράκη" → "Zafeirakis Estate") are
  transliterated proper nouns, not translations of meaning — the same
  treatment `team.json` gives a person's name.

The menu section no longer forces `lang="el"` — it takes `lang={locale}` like
the rest of the page, since its content now genuinely differs by locale.

**The menu content is real client data.** Never invent a dish or a price. An
English *translation* of an existing dish is expected now (the client asked for
it) — what stays off-limits is inventing a dish, a price, or a translation that
changes what's actually being served. Nine items have `"price": null` because
the client has not priced them; they must still render, with an em dash.

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

**The homepage is one ground with drawn edges. It used to be alternating tiers,
and the older rule is gone — do not reinstate it piecemeal.**

Every band below the hero is `--charcoal` (#221f1f): Our Goal, From the kitchen,
Take away and Find Us. The hero, the nav and the footer stay `--black`
(#181414), one step darker, so the page reads as a single dark ground with its
two ends pinned slightly deeper. Measured on the rendered page: bands
`rgb(34,31,31)`, hero and footer `rgb(24,20,20)`.

**What separates one band from the next is now a line, not a tone.**
`.section-dark` carries `border-top: 1px solid var(--rule)` — Light Stone at
30%, the same hairline the nav has always carried under itself — and
`main > .section-dark:last-child` adds a matching bottom edge so the run closes
against the footer rather than stopping short of it. Four boundaries, one
construction. If you remove that border you do not get a subtler page, you get
one undifferentiated column: the tone step that used to do the work is not
there any more to fall back on.

The rule this replaced was **"no two bands in a row share a background"**, and
the whole tier system existed to serve it — `.section-stone` was invented so the
page could step light / mid / dark instead of slamming salt into black, and Our
Goal sat on the mid tier *because* the hero above it is black. None of that
applies now. `.section-stone` is consequently unused; it is kept, with a note on
the rule saying so, because it and `--wood-pale` only make sense together and
would have to be reinvented as a pair.

**Take away was the band that rule cost the most, and it is worth knowing what
was traded.** It was light *specifically* to keep two photo bands apart: From
the kitchen sits directly above it as four plates on a dark ground, and the
strip of light around Take away's two inset panels was the boundary between the
two photo groups. That strip is gone and the hairline does the job instead,
which is a thinner boundary than a whole tier change. What keeps the two groups
from reading as one continuous run of photographs is that the panels are still
**inset, not full-bleed** — so that part is load-bearing now in a way it was
not before. Verified on the rendered page.

Contrast was re-measured on the new ground rather than carried over, since every
one of these sections changed tier: headings and CTAs (`--salt`) 13.22:1, body
and muted text (`--light-stone`) 5.86:1, eyebrows and the phone number
(`--wood-light`) 5.75:1. All comfortably over. The hairline itself composites to
about 1.7:1 against the band — it is a decorative divider, not a control or
meaningful graphic, so no non-text minimum applies to it, but it *is* faint by
design and that is the look that was asked for.

**The nav was the first thing to solve this, and the bands now copy it.** It is
black and sticky, so it could never re-tier itself the way sections could, and
it passes over dark ground the whole way down. What keeps it a bar is
`border-bottom: 1px solid var(--rule)`, which on the bar's own dark tokens is
Light Stone at 30%: the only thing between the bar and the hero directly beneath
it, both `--black`. Removing that hairline does not look like removing a border,
it looks like the nav disappearing into the hero. Do not "tidy" it.

**History, kept because the reasoning was sound and may be needed again if the
page ever goes back to tiers.** Tiers were a consequence of the *order*, not a
property of each section, so moving one re-tiered its neighbours. When From the
kitchen moved below Team it landed directly above Take away and both were black.
Of the two, **the photographs kept the dark ground and the text-only band gave
way**: food needs black and has nowhere else to go, while a heading and a phone
number read on any
tier — which is the same logic that put Our Goal and Find Us on stone. So Take
away is now a light band. Work the sequence out in full before changing an
order; there are only three tiers and both ends are pinned black.

**Each section on the homepage uses a different layout — with one deliberate
pairing.** Hero is a split, Our Goal is a centred stack of text, From the
kitchen is a centred head over a staggered photo row, Take away is two small
rounded photo cards that are themselves the call buttons, over a centred stack of
two paragraphs, Find Us is a text and image split.

Take away's own notes are centred and stacked at the client's request, on the
same 46rem axis as Our Goal and with the measure on the container rather than on
each paragraph — see the note on `.contact__notes`. That makes three centred
compositions on a four-band page, which is the failure mode recorded under the
Team history below; what still separates them is that this one is a pair of
*controls* over its text rather than a heading and a button.

**The three band headings are one size.** `.goal__heading`, `.plates__head h2`
and `.find__head h2` are all `--step-2`. None of them uses `.section-head`,
which is `--step-3`: that class and a per-band override have equal specificity,
so keeping it would have made each heading's size depend on which rule came
later in the file. `.section-head` still owns `/menu`, `/gallery` and `/team`,
where `--step-3` is a page title rather than a band label.
`.section-head--inline` existed only for Find Us and went with the change.

Our Goal and From the kitchen now share a composition on purpose: both are a
centred heading at --step-2, body copy at --step-0 under it, and a centred
.btn--primary, on the same 46rem axis. The client asked for the second to match
the first. What still tells them apart is what sits between the head and the
button — nothing in Our Goal, four photographs in From the kitchen — so the
repetition is a *rhyme* between neighbours rather than the Team-and-Find-Us
problem below, where two bands were the same shape doing the same job. Worth
watching, though: it is the same failure mode one step earlier, and a third
centred stack would be too many.

**That rule was being broken by Team, and moving Team to `/team` is what fixed
it** — worth recording, because the repetition problem was live for a long time
and two different attempts were made on it. As alternating rows the section ran
the same image-and-text composition once per member, and Find Us below is
another of the same shape, so at five people the homepage ran that composition
six times and **Team and Find Us were no longer distinguishable shapes**. The
first attempt was a portrait grid, which held the section to 1030px and did
break the repetition — and was reverted, because five equal columns are ~220px
and set a bio about four words to the line. The client chose the measure over
the page length.

The second attempt is the page. The rows keep their full width, the homepage
loses the repetition, and neither had to be traded for the other. The numbers:
Team was **3249px** at 1366x768, 4.2 viewports in one band, and 4507px on a
390x844 phone. The homepage went from ~7786px to **4537px** — it lost 42% of its
height to one move. Before adding a section here, still check what shape its
neighbours already are; Find Us is now the only instance of that composition on
the page.

**From the kitchen is not in the nav — but the width argument that used to
forbid it is gone, so do not repeat it.** It said "cannot be", and that was
true while the bar collapsed at 64rem: a seventh Greek label cost ~133px against
70px of clearance at 1025px and pushed the bar to a 1080px scroll width.

Moving the collapse to 75rem for the logo changed the answer. Re-tested at
1201px by cloning a label in: it costs 117px, clearance goes 150px → 24px, and
`scrollWidth` stays at 1201. **It fits.** So the band is out of the nav as a
content decision — it is reached by scrolling and its own button goes to
`/gallery` — not because the bar has no room.

**The margin has since shrunk and that test was not re-run.** The nav logo went
3.5rem → 5rem and took 24px of the row, and the language control went from a
two-letter pair to the word "English" and took 34px more, so clearance at 1201px
is **121px**, not the 150px the test started from. A 117px label would leave 4px.
Re-measure with the real label before believing it still fits — on this figure
it very nearly does not.

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
exposes two methods, and both template-cloning section scripts call the first
one immediately after putting the clone in the page:

- `refresh()` — re-apply the current locale over the whole document, clones
  included. Call it right after `append`.
- `setLabelKey(el, key)` — for a control whose label changes with its *state*.
  The nav toggle is the only caller now that the hero stop button is gone; the
  API stays because it is the only sanctioned way for a script to change an
  `aria-label`. The script picks the key; the string still comes from the
  dictionary, so the switch keeps working on it afterwards.
**Both take a key, never a string, and `dict` being private to the closure is
what enforces it.** A script that wrote the words itself would have to hard-code
both locales, and would go stale the moment the copy moved. Re-aiming the
attribute is also what keeps the language switch working afterwards: `apply()`
re-reads `data-i18n` off the DOM.

There was briefly a third, `setTextKey`, the same idea for *visible* text. It was
added for the after-hours phone swap and removed with it when both numbers went
onto the panels. Recorded because the shape is the reusable part: if visible text
ever has to change with state again it is four lines, and it must still take a
key, for the reason above.

Both are called with `?.` — the section scripts are modules and run after the
inline one, but a control still has to work if it never loaded. The type lives in
`src/env.d.ts`.

**The hero carousel has no stop button any more, and that is a known WCAG 2.2.2
failure the client accepted.** This section used to say the button was required,
because it is. Recording what changed rather than deleting the rule:

The slides advance every **3s** (was 6s) and never stop on their own. WCAG 2.2.2
requires that anything moving automatically for more than five seconds can be
paused, stopped or hidden. `.hero__pause` — bottom-right of the hero, its own
`<template>` child, a scrimmed disc — was that mechanism, and it was removed on
request along with the `stopped` flag and the `a11y.heroPause` /
`a11y.heroPlay` keys.

What is left is **not** a substitute, and neither half of it ever was:

- The `pointerenter`/`focusin` hold is a convenience. A touch visitor has no
  hover, and the hold ends the moment the pointer leaves. That is precisely why
  the button existed; `start()` now bails on `hovering` alone.
- The dots jump between slides. They do not stop the timer.
- `prefers-reduced-motion` skips the whole block, so that visitor gets a still
  hero. It covers the vestibular case, not 2.2.2, which is about control.

Shortening the interval does not help either: 2.2.2 counts the total duration of
the movement, not the gap between steps. Restoring compliance means putting a
stop control back — and if one returns, it returns with its scrim, for the
reason in the note on the dashes below.

The gallery *tiles* are the deliberate exception and stay in the page: each is an
`<a>` pointing at the full-size photo, so it still goes somewhere real when the
script does not run, and JS only intercepts the click.

**Scroll-snap is `proximity`, and making it `mandatory` breaks the page.** The
bands are not viewport-sized and cannot be. Re-measured at 1366x768 after Team
moved to its own page: Plates 834, Contact 1004 and Find Us 1082 are all taller
than the screen. Team was the extreme case at **3249px**, 4.2 viewports on its
own, and it is gone from this page — but the remaining three still rule
`mandatory` out on their own. Take away used to be the short-band case at 232;
the two photo panels took it past a full screen, so there is no longer a band
short enough for a whole screen to be absurd either.
`mandatory` pulls the reader out of a band they are still reading and gives the
short band a whole screen for two lines. `proximity` only settles a scroll that
already ended near a boundary, so tall bands scroll through normally. Snapping is
gated at 48rem (below it there is nothing to settle onto) and on
`prefers-reduced-motion` (it moves the page without being asked). This is also
why full scroll-hijacking — one wheel tick per section — is not on the table:
it would hide the bottom of Find Us and Take away and break every `/#anchor` in
the nav.

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

**The hero wordmark is the site's only display type, and it is deliberately off
the step scale.** `.hero__wordmark-name` is `clamp(3rem, 1.8rem + 5.5vw,
5.5rem)` — 88px at 1366, 50px at 390 — against the 47px that `--step-3` tops out
at and that is otherwise the largest thing on the site. It stands in for the
214px logo it replaced, not for a heading, which is why it is a literal clamp
rather than `--step-4`: promoting that token for one use would drag it out of a
ramp nothing else uses. Tracking is `-0.04em`, tighter than the `-0.02em`
headings take, because a geometric sans at 88px opens up otherwise.

The badge did not go anywhere — it still carries the nav, the footer and the
favicons. What it stopped doing is standing on the black hero, where its baked-in
concrete texture read as a pale disc with a word in it rather than as a mark on
the ground. That was recorded as an outstanding artwork problem in README for
months; setting the name in type is what actually resolved it, so the note there
now describes a smaller problem than it used to.

**Stone on the hero means `--light-stone`, never `--stone`.** The wordmark, its
tagline and the `.btn--primary` fill are all `--light-stone` at 6.55:1 on the
hero's Deep Black, measured on the rendered page. `--stone` is 2.9:1 there —
under even the 3:1 large-text floor, so it fails as a heading colour and fails
much harder as a button label. The CTA's hover therefore goes *lighter*, to
`--salt` (14.8:1 under a black label), rather than darkening the way the old
`--wood` fill did: mixing black into a mid stone walks the label back toward the
2.9:1 that ruled `--stone` out to begin with.

**`.btn--primary` is now every button on the site.** It was the hero CTA
alone, with From the kitchen and Find Us outlined as `.btn--ghost` against it;
the client asked for all three to match, so the ghosts went. One pair of numbers
covers the set now: the fill is 6.55:1 on the hero's Deep Black and 5.86:1 on the
charcoal bands, both well over the 3:1 a control's boundary needs, and the black
label is 6.55:1 on the fill in every case. Measured on the rendered page.

`.btn--ghost` is consequently unused. It is kept, and flagged as such in the
stylesheet, because it is the only consumer of `--ghost-hover-bg` /
`--ghost-hover-fg` and those are declared on eight surfaces — the rule and the
tokens have to go together or not at all. This is the second kept-but-unused
block, after `.section-stone`; both are labelled, neither is an oversight.

`--wood` is still a surface on `/menu`, where the selected menu tab uses it.

**Section eyebrows were a bug, not a device. There are no section eyebrows, and
the one eyebrow on the site earned its place by passing the test that killed the
rest.** Every section used to render one from its `nav.*` key, which in five of
six cases was the heading verbatim — two identical titles stacked. Our Goal was
the last holdout, kept because its heading was a *sentence* ("To serve fish with
the respect it deserves") and the eyebrow was the only thing naming the section.
That stopped being true when the client asked for one title instead of two: the
eyebrow's words were promoted to the heading at the sentence's size, the
sentence was cut, and `goal.lead` was deleted with it. Do not add eyebrows back
per-section without new copy that says something the heading does not.

The Take away cards are the case history, and there is no eyebrow left on them
either. Four passes, all decided by the same question — *does this label
distinguish anything?*

1. "Κράτηση" above "Κλείστε τη θέση σας" — the two-titles-stacked failure
   exactly. Rejected before shipping.
2. A single "Εντός ωραρίου" above the title. It passed: it said *when the number
   answers*, which the title cannot. But it only worked while a card had one
   number.
3. Two numbers per card, so the label moved down beside the number it described —
   and came off take away entirely, which had one number and no choice to
   describe.
4. The cards became buttons, the clock reduced each to one number again, and the
   label went with the choice it existed to explain.

So the rule has removed a label three times and kept it twice, always on the same
question, and the answer changed every time the *layout* changed rather than the
copy. Before adding one back, ask what on screen it tells apart.

Two consequences worth knowing. `.eyebrow` still matches no markup — it is kept
because `.section-head p:not(.eyebrow)` still names it, and that guard should
stay defensive whether or not an eyebrow exists today (see the specificity note
further down for what happens without it). And Our Goal's heading reads
`nav.goal`, not a heading key of its own: there was a `goal.heading` once and a
dead-key sweep removed it for never being rendered, so rather than re-adding a
second key holding the same two words, the nav label and the section title share
one string deliberately.

**Our Goal is one centred column, and it is the only band with a link out of
it.** Heading, first paragraph, second paragraph, `.goal__cta` — a
"Meet the team" button pointing at `/team`, added when Team moved off the
homepage so the section describing how the place works still leads somewhere.

The measure sits on `.goal__body`, not on each paragraph, which is the
opposite of what the two-column grid did and is what centring requires: centred
lines are read by their middles, so both paragraphs have to share one axis or
the block comes apart. 46rem is deliberately narrower than `--measure` (62ch),
because centred text wants a shorter line — there is no fixed left edge for the
eye to return to.

**Two things were given up for this, both on purpose.** The section was a
two-column grid, and the button was pinned to the end of the second column so
it sat on the same vertical line as `.plates__cta` in the band below — that
alignment is gone, because a centred section puts its button in the middle of
the page. Do not reinstate the old `margin-inline-start: auto` media query
without moving the section back off centre; the two cannot both be true.

And the first paragraph is ~60 words, which is long for centred setting. The
client asked for it with that pointed out. If it ever reads badly the fix is to
range the paragraphs left inside the same centred column — drop `text-align`
from the `p` rule — rather than to widen the column.

**Four pages.** `/` is the scrolling homepage; `/menu` is the menu and its
legal block; `/gallery` is the photographs; `/team` is the five member rows,
moved off the homepage for its height. Nav links to homepage sections must stay
rooted (`/#goal`) so they work from the other three — only two of the six nav
entries are anchors now, the rest are pages. The `Restaurant` JSON-LD
lives on `/` with `hasMenu` pointing at `/menu`; the `Menu` graph is emitted
only on `/menu` via Base's `menuSchema` prop. `/team` adds no graph of its own.
Each page needs exactly one `h1` — Gallery's and Team's section headings are
`h1`s (Team's was an `h2` while it sat on the homepage, and its member names
went `h3` -> `h2` with it, so the page does not skip a level), and on the homepage the `h1` is the hero
wordmark, which is now **typeset, not an image**. It is two spans, the name and
the tagline, and the accessible name comes from the text itself rather than from
an `alt`. Verified in Chrome's a11y tree: the heading computes as "fokia seafood
bar", with the space supplied by AccName's node separator — `textContent` alone
runs them together, so do not "fix" that by reading the DOM.

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
  renders exactly Manrope 400/500/600/700 and only those ship.
  `font-synthesis: none` means an unshipped weight is not faked — it falls back
  — so adding a weight in CSS means adding its files too.

- **One family, and the client asked for it that way.** Manrope carries
  everything; `--font-body` and `--font-display` both resolve to it. They stay
  two tokens so a display face can be reintroduced by editing one line rather
  than by working out which of ~20 `font-family` declarations meant "heading".
  Headings are 700 against the 600 that labels and buttons use — with a single
  family the weight is the only thing separating a heading from the text under
  it, where the old serif could sit at 600 and still read as another voice.
  Headings also carry `letter-spacing: -0.02em`: a geometric sans reads loose at
  default tracking once it is set large. The largest heading on the site is 47px
  — `--step-3` at its ceiling, measured on the rendered page. `--step-4` exists
  in the scale but nothing uses it, so it is not the number to quote. Body copy
  deliberately keeps the default tracking.

- **Manrope ships no italic, in any weight, so `font-synthesis` is off for style
  too.** Left on, the browser shears an upright into a fake oblique, and
  mechanically slanted Greek is conspicuously wrong — Greek italics are a
  different construction, not the upright at an angle. Consequence:
  `font-style: italic` anywhere in this codebase now renders as plain upright,
  silently. The one place that used a real italic — `.menu__item-wine`, the
  producer line on /menu — carries its distinction with weight 500 instead,
  which matters because upright it would be identical to `.menu__item-desc`,
  the one thing it has to be told apart from.

- **Manrope covers Greek, which is why this swap was possible at all.** Not a
  given for a geometric sans — check `unicode.json` in the `@fontsource` package
  before agreeing to any future face. A Latin-only family would leave the whole
  Greek site on a fallback and split mixed-script dish names across two
  typefaces mid-line.
- `<picture>` must stay `display: contents` (set in `global.css`). It is inline by
  default, which silently breaks `height: 100%` on the `<img>` inside it.
- `<figure>` has a default `margin: 1em 40px`; the reset zeroes it. Without that,
  gallery images render narrower than their column.
- Team lives on `/team` and is **alternating photo-and-text rows**, and the type
  is sized for that:
  `.team__name` is `--step-2` and the bio takes `--measure` rather than the
  `--step-1`/`--step--1` pair the ~285px grid column needed. If it ever goes
  back to a grid, both move again — they are a property of the column width, not
  of the section.

  **The reversal brought its gotcha back with it: reversing a row needs the
  track sizes swapped as well as `order`.** `.team__member:nth-child(even)`
  flips `grid-template-columns` from `4fr 8fr` to `8fr 4fr` *and* sets
  `order: 2` on the photo. Setting `order` alone drops the portrait into the
  wide track, which at 4:5 doubles that row's height and pushes the next member
  off screen. Verified after the restore: the photo measures 402px and the text
  804px on every row, odd and even alike.

  The member count is otherwise free — rows stack, so five or six need no CSS
  change. The cost is page height; see the layout note above.
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
- The nav is logo, links, utilities — three items in flow, nothing positioned,
  and **the links are centred on the bar**. `.nav__inner` is a `1fr auto 1fr`
  grid: the middle track is centred against the container, so the logo (80px)
  and the utilities (192px) can be wildly different widths without dragging the
  links off centre, and all three stay in flow.

  That is the whole reason it is grid and not something simpler. The obvious way
  to centre one of three flex children is to position it absolutely, and this
  bar has been there before — it used to centre the *logo* that way, which took
  it out of flow, left nothing holding the middle, and is why the links were
  once split into two balanced groups either side of it. Do not go back to that.
  `justify-content` cannot do it either: it distributes all three children, so
  the links only land in the middle when the two outer items happen to match.

  `margin-inline-start: auto` stays on `.nav__utils` and does a different job in
  each layout — end of its own track in grid, pushed to the end of the row in
  flex. The collapsed bar sets `display: flex` back, because it wraps the links
  onto a full-width row and orders four children, which is not a three-column
  grid's job.

  **Centring is exact above ~1230px and 14px out at 1201px.** The side tracks
  take an automatic minimum from their content, so the split is only even while
  each `1fr` share is wider than the item sitting in it. At 1201px the shares
  would be 178px and the utilities need 192px, so that track grows and the
  middle shifts left by the 14px difference. It never overflows — `scrollWidth`
  is 1201 — and 14px is 1.2% of the bar, but it is the number that moves first
  if anything in the utilities gets wider.

  **Clearance stopped being the right measurement when the links were centred.**
  It used to be the gap between the links and the utilities, and it worked
  because everything was packed at the start of the row, so that gap *was* the
  slack. With a centred middle track the leftover is split into two gaps and
  neither is the headroom. At 1201px the tracks now pack exactly: the measured
  links-to-utilities gap is 24px, which is the grid `gap` itself — **zero
  slack**. The figures below are kept as history. The live test is
  `document.documentElement.scrollWidth` against the viewport, which is what
  this file has always said actually counts.

  **The bar collapses at 75rem, not 64rem, and the logo is why.** Clearance at
  1025px was 70px in Greek; the logo spends 48px of that plus the row's 24px gap
  — 72px against 70px — so the full bar stopped fitting at the old breakpoint
  and hands over to the toggle sooner. Measured at 1201px, the first width above
  the new breakpoint, clearance is **121px** and `scrollWidth` equals the
  viewport. Re-measure at 1201px, not at 1025px.

  History worth keeping, because the figure has moved three times and each move
  was a different cause: 62px, until the social icons went 2.15rem → 2.75rem for
  the touch target and spent 19px; 43px, until `--font-body` went Inter →
  Open Sans, the narrower face, which gave 27px back (Inter set those six Greek
  labels 29px wider in total, measured on a canvas at the nav's own size); 70px,
  until the logo took 72px and moved the breakpoint to 75rem instead; then 146px
  at the new breakpoint, 160px once `--font-body` went Open Sans → Manrope,
  narrower again by 14px across the six, **136px** once the logo box itself went
  3.5rem → 5rem and spent 24px, and **121px** once the language control became
  one button and spent 34px more — after which the links were centred and the
  measurement stopped meaning anything (see above). Two of those were a change
  of *face*, which is the pattern: re-measure whenever `--font-body` changes,
  whenever the logo box is resized, and now whenever the language button's copy
  changes — it is the one label in the bar that is a word rather than a code.
  "Κλείστε τη θέση σας • Take away" is still the longest nav label and Greek is
  still the longer set, so Greek decides the fit, not English.

  The language button still takes its 44px from `min-height` rather than from
  vertical padding, which is why the height costs the row nothing. Its *width*
  is no longer free, though — that note used to say the two-letter labels never
  changed the pill's width, and one of them is now a word.

- **The nav is a dark surface inside the light tier, so it carries the dark
  tier's tokens itself.** `.nav` sets `--text`, `--text-muted`, `--accent`,
  `--ghost-hover-*` and `--rule` the same way `.section-dark` and `.lightbox` do.
  Painting the background black without them leaves the links at `--stone` and
  the hover at `--wood` (2.3:1 on Deep Black) — the background is the easy half.
  Measured on the rendered bar: links and social icons are 6.55:1 at rest and
  **14.77:1 hovered**, and the language button's stone fill is 6.55:1 against the
  bar with its black label at 6.55:1 on the fill.

  **Hover in the bar is white, not wood.** Nav links and social icons both go to
  `--salt` on `:hover` and `:focus-visible`, matching the Find Us links and the
  lift `.btn--primary` makes. On a nav link the label and the rule under it move
  together — `--text-muted` to salt, transparent border to salt — so the target
  reads as one lit object rather than a grey word with a bright line beneath it.

  **The one wood tint left in the bar is the current-page marker**, and it is left
  there on purpose. `[aria-current='page']` keeps a `--accent` underline while
  hover is salt; if it went salt too, "the page you are on" and "the link under
  your pointer" would look identical. The global focus ring is also still
  `--accent`, which is wanted for the same reason — a focus indicator should not
  be mistakable for a hover.

  **The wood tint that used to fill that pill is gone, and so is the reason for
  it.** It was a two-segment control and the fill marked *which segment was
  selected* — `--wood` at 6.6:1 on the old salt bar, then `--wood-light` at
  6.4:1 once the bar went black, because `--wood` there is 2.2:1 and the
  selection stopped reading as a selection. There is one button now and it
  reports no state, so the fill is not marking anything; it is simply the site's
  second filled control, and it matches the first (the hero CTA) at
  `--light-stone` under a `--black` label. That leaves `/menu`'s selected tab as
  the only place a wood tint is still a *surface* rather than text.
- Anything drawn over a photo needs its own backing, not a tint on the image.
  The hero photos are mid-grey exactly where the controls sit, so the carousel
  dashes measure 1.7-2.3:1 against them — under the 3:1 WCAG minimum for a
  control, on every slide. That one is a **recorded trade-off**: the dashes were
  given a scrim pill and it was reverted for the lighter look, so they stay as
  they are. It does not extend to the other controls over those photos. The
  lightbox arrows use the reference gallery's two-triangle construction, a light
  arrowhead over a larger dark one, which does the same job as a scrim.
  `.hero__pause` used to be the other example and is gone, but the principle it
  illustrated is the one to keep: a *position indicator* can carry a contrast
  trade-off, a control someone has to find on every slide cannot. Any control
  put back over these photos gets a backing. If the dashes' contrast is ever
  raised, put the surface back rather than
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
  whatever had focus, most visibly the square gallery tiles. The pill buttons
  are the same mechanism seen from the other side — their focus ring is a
  rounded capsule without the rule knowing anything about it.

- **A rounded control needs `-webkit-tap-highlight-color: transparent` of its
  own.** `html` sets a site-wide tap highlight — `--wood` at 20%, chosen over
  the UA's blue-grey wash. Chrome paints that highlight against the element's
  border *box* and ignores `border-radius`, so on the 999px `.btn` pill a tap
  flashed a hard-edged wood rectangle around a round button. It was reported
  from a device, not caught here: it cannot be seen with a mouse, and it does
  not show up in a screenshot either, because the highlight is a compositor
  effect. `.btn` opts out and defines `:active` states instead, which follow
  the pill. The wash stays on `html` for ordinary links, where a rectangle is
  the right shape. Any future rounded control needs the same pair.

  **`.lang` is the case that sentence predicted, and it took a year to arrive.**
  The language switch became a 999px pill when the two-segment control collapsed
  into one button — and the opt-out did not come with the radius, so a tap
  flashed the wood rectangle exactly as `.btn` once did. Reported from a device,
  again. It now carries `-webkit-tap-highlight-color: transparent` and keeps its
  `:active` fill.

  **Two rounded controls still have the gap**, both on `/menu` and both
  tappable: `.menu__tab` and `.menu__jump a`. Neither has an `:active` state
  either, so fixing them is the *pair* — opting out of the highlight on its own
  would leave a tap with no feedback at all, which is worse than a wrong-shaped
  one. `.menu__tablist`, `.menu__tag` and `.lightbox__counter` are also 999px and
  do not need it: none of them is interactive.

- **A `:hover` state on a control a touch user will tap must be gated behind
  `@media (hover: hover) and (pointer: fine)`.** A touch browser fakes `:hover`
  on tap and then leaves it applied — there is no pointer to move away, so
  nothing clears it. The Take away cards are `tel:` links, so a tap opens the
  dialer, and on returning the card was still sitting in its hover state, lifted
  and zoomed, until something else was tapped. It was reported from a device as
  the effect "going away" when you come back, which is what a stuck state looks
  like at the moment it finally clears — the same shape of bug as the tap
  highlight above, and equally impossible to see with a mouse.

  Two things about the fix are worth copying rather than rederiving. `pointer:
  fine` is in the query as well as `hover: hover` because a device can report
  both — a laptop with a touchscreen, a phone with a mouse attached — and the
  pair asks the narrower question: is there a pointer that can hover *and* aim
  precisely. And `:focus-visible` stays **outside** the gate: it is the
  keyboard's affordance, a keyboard is not a pointer, and it does not fire on a
  tap. Gate the hover, duplicate the declarations onto `:focus-visible`, and let
  `:active` be the whole of the touch feedback — it lasts exactly as long as the
  finger is down and leaves no state behind.

  **`.lang` hit this next, and it is the clearest case on the site.** Tapping the
  language button does not navigate anywhere — the language switches in place and
  the button stays under the finger — so it sat lit at `--salt` until something
  else was tapped, and was reported as the button "remaining white instead of the
  stone colour". Its `:hover` is gated now; `:active` still fills salt.

  Note what the gate does and does not do. On an emulated phone the button still
  reports `matches(':hover') === true` after a tap — the browser's emulation is
  not something CSS can switch off. What the media query removes is any *styling*
  hung off it, which is the whole of the visible symptom.

  **Still ungated, all with the same latent bug**, listed so the next person does
  not have to re-derive the set: `.nav__links a`, `.social a`, `.menu__tab`,
  `.menu__jump a`, `.gallery__item`, `.btn--primary`, `.find__contact a`,
  `.find__map`, `.lightbox__arrow`, `.lightbox__close`. They vary in how visible
  it is — a nav link that navigates away takes its stuck state with it, while a
  `tel:` link in Find Us or a `/menu` tab leaves the visitor looking at it. Each
  needs an `:active` state as part of the fix, which is why they were not swept
  in one pass.

- **A `transform` on a child silently reorders painting, and it took out the
  scrim.** `.contact__panel:hover img` scales the photograph, and a transformed
  element creates a stacking context painted in the same pass as positioned
  descendants with `z-index: auto`, in DOM order. The `<img>` comes after
  `::before` in that order, so hovering painted the photograph *over* the scrim
  and the text protection disappeared for exactly as long as the pointer was on
  the card — title contrast measured **1.00:1** in that state, against 11.78:1 at
  rest.

  It shipped because every contrast sweep had been taken at rest. Two rules out
  of it: give every layer in a card like this an explicit `z-index` rather than
  relying on DOM order (img 0, scrim 1, wash 2, text 3), and **sample the hovered
  state as well as the resting one** whenever a hover changes anything behind
  text. A screenshot of either end state on its own looks perfectly fine.

- **An image frame's own `background` paints in the anti-aliased fringe of a
  rounded clip, so on dark ground it must be dark.** `.contact__panel` used
  `--salt-deep` like the site's other image frames, and it showed as a pale
  hairline tracing the card's 1.75rem corner — reported from a device as "a white
  line below the card on hover". Hover is where it becomes obvious rather than
  where it starts: the wash that had been dimming the fringe fades out, so the
  same artifact roughly doubles in brightness. Measured on the bottom-left curve,
  hovered: brightest fringe pixel **72 → 44** once the background went `--black`,
  against a card interior of 27 and a band of 31.

  It needed all three of a large radius, a transform, and a light background, so
  `.team__photo` and `.find__media` are not affected — both are `--radius` (2px)
  and neither is transformed. They do still flash a light block while their lazy
  image loads on a dark band, which is the same choice made worse in a different
  direction, and is worth fixing if anyone notices.

  Measuring this needs a pixel scan, not a screenshot: it is one or two pixels on
  a curve, and it is only there while the pointer is on the card.

  **Fixing the background was not the whole of it.** A second, larger source of
  the same hairline is the photograph itself: both images run bright right up to
  the card's boundary — concrete along the top and left of the table setting —
  and a near-white pixel anti-aliased against `--charcoal` is a light line. That
  one is not a bug and not device-specific; hover simply makes it obvious,
  because the wash that had been dimming it fades out. `.contact__panel::before`
  carries a 2px inset dark ring for it.

  Three things about that ring cost time and are worth not rediscovering:

  - **It must be on `::before`, not on `.contact__panel`.** An inset shadow is
    painted immediately after the element's own background and *before* its
    content, so on the card the `<img>` covered it completely — applied,
    computed, and doing nothing. `::before` is above the image in the stack and
    has no content of its own to hide it.
  - **2px, not 1px**, because at a 125% display scale the card's edges land on
    half-device-pixel boundaries and a 1px ring only partly covers the outermost
    row. 1px fixed the left edge (157 → 52) and barely touched the top (145 →
    126); 2px brought all four sides to 35-59 against a band of 31.
  - **Reproduce at the right device scale.** None of this is visible at dpr 1.
    Launch a dedicated Chrome with `--force-device-scale-factor=1.25`, its own
    `--remote-debugging-port` and `--user-data-dir`, then
    `npx playwright-cli attach --cdp=http://localhost:<port>` — and stop only
    that pid afterwards, never by image name.

- **The darkening on these cards is two layers, and only one of them may move.**
  `::before` is the scrim: it carries the title and number over blown highlights,
  it is what the measured ratios describe, and it is static. `::after` is the
  wash — a flat 30% black over the whole card that fades to 0 on hover and comes
  back over 1.2s when the pointer leaves. Animating the scrim itself would walk
  the text contrast to nothing on every hover.

  Because the wash only ever *adds* darkness, hovered — wash fully gone — is the
  contrast floor, and no state in the animation is worse than the table above.
  Flat rather than a gradient on purpose: the bottom of the card is already at
  90-94% black from the scrim, so a flat wash adds almost nothing there and
  almost all of its effect where the picture is clean, which is why the card
  reads as lighting up from the top down rather than the text flickering.

  The two durations are asymmetric and that is deliberate: a transition belongs
  to the state being *entered*, so the 0.8s lives on `:hover::after` (the fade
  out) and the 1.2s on the base rule (the return). The picture comes up promptly
  under the pointer and settles back at its own pace.

- **A big surface needs a slower transition than a small one, and `ease` is the
  wrong curve for it.** The cards moved on 0.2s `ease` and read as a snap: `ease`
  is front-loaded, so most of the travel happened in the first third and the
  settle was invisible. They are 0.45s on `cubic-bezier(0.22, 0.61, 0.36, 1)`, a
  decelerate — quick to commit, long to arrive — with the photograph inside them
  at 0.8s, deliberately lagging the card, because the lift is the response and
  the drift behind it is the depth. The one exception is `:active`, which
  overrides to 0.1s: a press has to land under the finger, not half a second
  after it.

- **`.btn` is fully round (999px); `--radius` (2px) is still everything else.**
  The site's default is near-square and that is still right for rectangular
  surfaces — inputs, image frames. **The language switch is no longer one of
  them:** it stopped being a two-segment box that needed a frame around it and
  became a lone control, so it is a pill too, written as the same literal 999px.
  It is not a `.btn` and does not want to be — it carries its own smaller type
  and its own `min-height`.

  `.btn` itself is three places and all three are on the homepage: the hero CTA,
  the From the kitchen CTA, the Find Us map button — and all three are
  `.btn--primary` since the client asked for them to match, so the pill, the
  fill and the label are one style rather than two. Nothing on /menu, /gallery or
  /team uses `.btn`, so that change could not leak.

  Written as a literal `999px` to match every other pill already in the file
  (the menu tab group, the jump chips, the tags) rather than adding a second
  radius token for one rule — the menu page was already round, so this brought
  the two into line rather than apart. Horizontal padding went 1.6rem → 2rem
  with it: at that radius the curve eats the corners of the text box, and
  uppercase at 0.08em tracking has no side bearings left to give.
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

  The `max-width: 22.5rem` block buys the room back out of spacing and out of
  *copy*, not out of targets. Spacing gives up the row's column gap,
  `.nav__utils`'s gap and the language button's horizontal padding; copy gives
  up the word.

  **The word is the expensive part, and it is why this block grew a label
  swap.** "English" makes the button 88px, which puts the row at 292px against
  the 280px a 320px screen leaves — 12px over, and the toggle went onto a second
  line exactly as it did the first time this bar was got wrong. Trimming padding
  alone recovers 13px and leaves 1px of margin, which is not a margin. So below
  22.5rem the button shows its two-letter code instead: 36px, and the row lands
  at **244px against 280px**. `min-width` is dropped there too — it exists to
  stop the bar jumping between an 88px word and a 48px code, and once both
  states are two characters there is nothing to reserve.

  The swap is CSS-only. `.lang__name` and `.lang__code` are both in the markup
  and both carry `data-i18n`; the media query picks which is displayed, and
  `apply()` re-aims both keys whenever the locale changes precisely because it
  cannot know which one is visible. No target shrinks: the social icons keep
  their 2.75rem box — the *mark* inside it grew 1.2rem → 1.5rem, which is free,
  while the box is both the touch target and the width budget and cannot — and
  the button keeps its `min-height`, so both stay 44px
  tall, and at 36px wide the button is still over the 24px floor. The logo stays
  3rem because it is the one thing in that bar meant to be looked at.

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
- **Dead code has been swept once; here is what the sweep could not see.** A
  grep for a class or a key gives false answers in both directions in this
  codebase, so anything removed has to be checked by hand first:

  - Keys are **built at runtime** from data — `team.${id}.name`,
    `gallery.${id}.alt`, `legal.${id}`, `hours.${day}` — and, since the
    language switcher became one button, from a *locale code*: `lang.${other}`,
    `lang.short.${other}` and `a11y.lang.${other}`, built in both Nav.astro and
    Base's inline script. That is six more keys, none of which appear literally
    anywhere. Deleting one breaks a page silently, because `npm run check`
    compares el.json against en.json and never asks whether a key is *used*.

    `lang.el` / `lang.en` and `lang.short.*` are **identical in both locale
    files** and are meant to be: they are autonyms, and a language names itself
    the same way whoever is reading — the same deliberate exception
    `footer.rights` gets. `a11y.lang.*` are sentences and do differ.
    `a11y.languageSwitcher` went with the `role="group"` wrapper it labelled.
  - Classes are built the same way: `.menu__panel--food` and
    `.menu__panel--drinks` exist only as `menu__panel--${view.id}`.
  - A mention inside a comment is not a use. The first pass of the sweep counted
    prose and reported three dead classes where there was one.

  What actually went: `goal.heading` (Our Goal's eyebrow is `nav.goal`; the
  heading key was never rendered), the seven long-form `hours.<Day>` names (only
  `hours.short.*` reached the page *at the time* — the client has since asked for
  full day names, so `hours.short.*` was renamed back to `hours.<Day>` and the
  Greek values written out in full; there is no short set now, which is why that
  sweep's reasoning is worth reading rather than its conclusion),
  `.wrap--narrow`, and three lib functions
  nothing imported — `missingKeys()`, `flattenItems()`, `unpricedItems()`.

  Later, and by the same rule: `contact.callUs`, and the `.contact__call` /
  `.contact__call-label` pair, when the numbers moved onto the two panels and the
  single centred block beneath them went. Worth noting because the *script*
  pointed at that same removed markup and nothing failed — see the phone-numbers
  entry below. `src/lib/hours.ts` went the same way when the clock-driven swap
  was dropped: `isOpenAt` was its only export and Contact.astro its only caller,
  so the file had no reader left — **and it came back one change later**, when
  the cards became buttons and something had to choose the number again. It was
  restored from git rather than rewritten, which is the point: a correct, tested
  module with no caller is dead code and should go, but the sweep is cheap to
  undo and guessing the logic a second time would not have been. The keys
  `contact.duringHours` / `contact.afterHours` were deleted twice for the same
  reason and are not expected back.

  The last two are the interesting ones: both carried doc comments saying they
  were used by `npm run check`, and the checker had its own copy of each walk.
  A docstring is not evidence that a function is called.

- Selectors drift away from the markup silently. `.menu__legal h3` matched
  nothing for as long as the block has rendered an `<h2>`, which left the one
  legally required heading on the site at default Garamond `h2` size instead of
  the small uppercase label it is written to be. Grep the tag, not just the
  class, when a rule looks like it is not doing anything.
- **The address in Find Us *is* the map link.** There was a "view on map" button
under it; the client asked for it to go, and the street line took over its
`href`. Three things about that are load-bearing:

- `findUs.viewOnMap` did **not** become a dead key. It is rendered inside the
  link as `.sr-only` text, so the accessible name is "Λάσκου 3 Ελευσίνα Δείτε
  στον χάρτη" — verified in the a11y tree. Appending rather than using
  `aria-label` keeps the visible words inside the accessible name, which WCAG
  2.5.3 (Label in Name) requires: a speech-input user saying "Λάσκου 3" still
  matches the link.
- The `site.mapUrl` guard stays. With no URL the address renders as plain text
  rather than as a control that goes nowhere — the same rule the button had.
- **Nothing on screen marks it as a link.** The client asked for the underlines
  to go from the phone, the email and the hours rows, and the address link
  inherits that. Colour does not distinguish it either, since it is the body
  colour. What is left is the hover and focus state in `.find__contact a,
  .find__map`; removing those would leave four links with no affordance at all.
  This is a recorded trade-off, not an oversight.

**Find Us runs a three-step ramp, and the emphasis is inverted from where it
started.** Heading `--step-2` salt, label `--step-1` salt bold, value
`--step-0` `--light-stone` — measured 32.4 / 23.4 / 18.1px at 1366. Labels
began as `--step--1` uppercase wood over `--step-1` values, i.e. small quiet
label over large value; the client asked for the opposite, so the block reads
label-first now.

Two things inside that are worth keeping:

- The strings were already sentence case in the locale files ("Ώρες
  λειτουργίας", "Opening hours"), so dropping `text-transform` was the whole of
  that change. The 0.16em tracking went with it — that is a caps measurement,
  and on lowercase it reads as letters drifting apart.
- "Stone" in this section is always `--light-stone` (5.86:1 on charcoal), never
  `--stone`, which measures **2.6:1** there and fails outright. Same call as the
  hero wordmark and the CTA fill. The day names took the same muted stone the
  times already had, and the rules between rows went with the underlines.

**The blocks read Address, Phone, Email, Opening hours — hours last, at the
client's request — and the hours themselves run Monday first.** That second one
is a sort, not a reordering of the data: every run, open and closed, is ordered
by `dayIndex(run.from)`. It used to be the open ranges in the order the client
listed them followed by the closed days, which put Monday last precisely because
Monday was the closed one. **It no longer is — the restaurant opens seven days —
and the sort is why that change needed no code**: nothing here assumes which day
is shut, or that any day is.

**Day names are written out in full, and there is no abbreviated set any more.**
The keys are `hours.<Day>` — "Δευτέρα", "Παρασκευή" — read as
`` t(locale, `hours.${run.from}`) ``. They were `hours.short.*` and the Greek
values were three-letter clips ("Δευ", "Παρ") while English was already spelled
out, so the two locales disagreed about what "short" meant; the client asked for
full names and the key lost the word with the abbreviation. Do not reintroduce a
parallel short set for one narrow layout — the measure is the thing to check
first. Measured at 1366px after the change: the longest row is "Δευτέρα –
Σάββατο" at 163px against 110px of times inside the 352px (22rem) cap, and 145 +
98 within 348px at 390px. Both stay on one line with room to spare, which is why
this was a rename and not a layout change.

**The text column is centred; the photograph is not.** `.find__col` carries
`text-align: center` and the photo keeps its own grid column beside it. Making
this a third full-width centred stack was the alternative and was not taken: Our
Goal and From the kitchen are already that shape, and a third would leave the
homepage running one composition in three bands out of four — the failure mode
recorded under the layout rule above. The hours list needs its own centring
because it is a fixed-width block of rows rather than a run of text, so the 22rem
cap moved from the `<li>` up to the `<ul>` where auto margins can act on it.

**The address, phone and email icons are inline SVG, not Font Awesome.** The
client asked for "fa icons"; what shipped is three glyphs in the same idiom as
`SocialLinks` — 24x24, `fill: none`, `stroke: currentColor` at 1.6 — for
reasons that would apply to any icon set: this site self-hosts everything it
renders and tracks its page weight, three glyphs do not justify a CDN request or
a webfont, and Font Awesome Free is CC BY 4.0, which carries an attribution
requirement nothing on the page currently satisfies. Inline SVG also inherits
`currentColor`, so the icons follow each link's hover and focus states without a
second rule. Every one is `aria-hidden` — the text beside it is already the
link's accessible name. If real Font Awesome is ever wanted, that is a
dependency decision, not a styling one.

**`mapUrl` addresses the place by Place ID, and that is a deliberate retreat
  from the browser's own URL.** A `/maps/place/…` URL ends in a `data=` blob
  that is length-prefixed — `!4m6` declares six following tokens, `!3m5`
  declares five — so removing one that looks redundant (`!16s`, a
  knowledge-graph id already implied by the `!1s` feature id) leaves the counts
  short and Google falls back to a name search on the wrong pin. The failure is
  silent in every way that matters: the URL stays well-formed, the button still
  opens Maps, `astro check` and `npm run check` both pass. It shipped, and it
  took the client to catch it.

  `https://www.google.com/maps/place/?q=place_id:<id>` is Google's documented
  form and has no such structure — one opaque string, nothing prunable. If
  someone ever puts a long place URL back, the rule is: paste it whole, never
  edit it. **Verifying a map link from here is not possible** — Google 302s to
  a consent page — so the check that actually counts is a human clicking the
  button once. What *can* be checked offline is identity: a `ChIJ…` Place ID
  base64-decodes to the two 64-bit ids in a place URL's `!1s` field, which is
  how this one was confirmed to be the same listing.

  `geo` is deliberately *not* kept in sync with the coordinates Google holds for
  the place: the client supplied `geo` themselves and it sits 1.3m off Google's
  marker. Both are right about different things — don't reconcile them.
- Opening hours are rendered as *contiguous* runs of days, not each entry's first
  and last. An entry listing Tuesday and Thursday must not render "Tue – Thu" and
  claim a Wednesday the restaurant is shut. Non-contiguous days become separate
  rows. Any day in `hours.closed` is still listed on the page as closed rather
  than dropped — a shut day is not a working hour, but omitting it leaves a
  visitor guessing. That array is **empty** at the moment: the schedule is
  Mon–Sat 18:00–00:00 and Sun 16:00–00:00, so nothing is shut. Keep the key
  rather than deleting it; `FindUs.astro` and the JSON-LD both read it, and the
  renderer handles an empty list without special-casing.
- **Placeholder data that looks real is invisible to `npm run check`.** The
  opening hours shipped wrong for months: `site.json` held invented times whose
  only warning was the word PLACEHOLDER inside `hours.$comment`, and
  `outstandingSiteFields` skipped every `$`-prefixed key outright — so the
  checker never mentioned them, while README had already listed them under
  "confirmed and in place". The walk now reports a PLACEHOLDER `$comment` when
  nothing under it trips a rule of its own, which is precisely that case and
  stays quiet where the data already flags itself (seo's example domain; geo's
  nulls were the other such case until the client supplied them).
  The wider lesson is the one at the top of this file: check the claim
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
  6.25rem. Re-verified by jumping to `/#goal` — the `/#team` anchor this used
  to cite is a page of its own now: the bar's bottom is at 97px and the section
  lands at 116px. Change one without the other and every anchored
  heading goes behind the bar, or sits in a band of nothing.
- Vertical padding on an inline `<a>` does not grow its row. The stacked mobile
  nav links need `display: block` or the tap targets collapse to ~26px.
- **`.section--tight` has been removed, and the reason is worth keeping.** It
  existed for one band — Take away, back when that was a heading and a phone
  number — because the full `--section-y` around two lines of text reads as a
  gap rather than as breathing room. That band now carries a photo set, so by
  the utility's own rule it takes the full padding, and nothing else in the site
  used the class. Rather than leave a rule that matches no markup (see the
  `.menu__legal h3` entry below for how that goes unnoticed), it went. If a
  short text-only band appears again, it is three lines of CSS to reinstate.

- **Each Take away card is one control that places one call, and the clock picks
  the number.** The whole card is an `<a href="tel:…">`, at the client's request
  that the panels behave as buttons. That is what forces the clock logic: a
  control that dials has to commit to one number *before* the tap, so it cannot
  simply show both and let the visitor choose.

  `site.json` holds two — `phone` (the landline) and `phoneAfterHours` (the
  mobile). The server renders the landline on both cards, the JSON-LD advertises
  the landline, and a visitor with no JavaScript keeps the landline, so the
  default is the *correct* number during service rather than merely a safe one.
  The script then rewrites the reservations card when the restaurant is shut.
  Take away never swaps: it can only be done during service.

  **The href and the visible digits are rewritten together and must never
  disagree.** The number is on the card precisely so there is something to check
  before tapping — a control that dials an invisible target gives a visitor
  nothing to verify, and someone whose JavaScript never ran would have no way to
  notice they are being offered the landline at 2am. Changing one without the
  other is the worst failure this section can have, because it looks fine.

  It is evaluated in **Europe/Athens**, not the visitor's timezone — someone
  calling from London at 22:00 is calling a restaurant where it is already
  midnight — which `Intl` handles, so no offset is hard-coded and DST needs no
  thought. The schedule is passed to the client from `site.hours.entries` rather
  than restated, so editing the hours moves the swap with them.

  The decision itself is `isOpenAt` in `src/lib/hours.ts`, not inline in the
  component, so the shipped logic is the logic that gets tested. `closes:
  "00:00"` means the *end* of the day, not the start of one: 16:00–00:00 covers
  16:00 up to but not including midnight, which is why 00:00 Wednesday is shut
  even though Tuesday ran "until midnight". A genuinely overnight range
  (20:00–02:00) is handled too, though nothing uses one yet.

  **This is the second time this feature has been built, and it was deleted in
  between.** For one revision both numbers were shown at once, each under a
  "Εντός / Εκτός ωραρίου" label, and `hours.ts` was removed as dead code with
  `isOpenAt` having no caller. Making the cards into buttons brought it straight
  back. Worth knowing before deleting it again: the labels
  (`contact.duringHours` / `contact.afterHours`) and `.contact__phone-when` went
  with that revision and are not coming back either — with one number on screen
  there is nothing for a label to distinguish.

  **Verify the open path by editing the schedule, not by waiting.** The shut path
  is whatever the clock happens to give you. The open path was confirmed by
  temporarily widening `hours.entries` to include the current minute, rebuilding,
  and checking both cards read the landline in both the `href` and the digits —
  then reverting. That exercises `isOpenAt` through the real script.

  **The selector is `[data-phone-swap]`, written by the same loop that decides
  which cards swap — never a hand-typed id.** An earlier version selected
  `#contact-phone`, which had stopped being rendered when the markup moved;
  `getElementById` returned null, the swap silently did nothing, and nothing
  caught it. `astro check` passes on that, `npm run check` compares i18n keys and
  never looks at markup, and the page renders perfectly.

- **The card photographs carry `alt=""`, and it is the card being a link that
  makes that correct.** Everything inside an `<a>` is concatenated into the
  link's accessible name, so the gallery's descriptive alt would prepend a
  sentence about a table setting to "Κλείστε τη θέση σας 21 3099 1571" — the name
  a screen-reader user hears before deciding whether to place a call. The picture
  illustrates the title; it does not identify the control. The same photograph
  keeps its real alt on `/gallery`, where it *is* the content. Verified in the
  a11y tree: the two names are "Κλείστε τη θέση σας 698 298 0267" and "Take away
  21 3099 1571".

  The card title is a `<span>`, not an `<h3>`, for the neighbouring reason: a
  heading inside a link is legal but makes the document outline claim a section
  where there is a control. The band's `.sr-only` `<h2>` is its heading, and the
  two card titles are the links' names.

- **Text over the Take away photos is safe because of the scrim, not the
  photos.** Both images have blown highlights in every third of the frame —
  brightest channel 255 in all of them — so an average reading of the source
  proves nothing. `.contact__panel::before` is a bottom-weighted gradient that
  is opaque enough to carry the block on its own. Verified the way it has to be
  verified: hide `.contact__panel-body`, screenshot the rendered panel, and
  sample every pixel of the box each line occupies. Re-measure that way if the
  photos are ever swapped — worst *single* pixel, never the mean, which ran 6.0
  to 14.6 here and would have hidden every failure below.

  **Sample the hovered state, not just the resting one.** The cards lighten on
  hover — a second layer, `.contact__panel::after`, fades out — so the resting
  state is the *best* case and hovered is the floor. Measuring only at rest is
  how a total failure of the scrim went unnoticed for a whole revision; see the
  stacking-order note below.

  Worst pixel over both cards, both locales, at rest and hovered, at 320, 390,
  768, 1024 and 1366px — five widths because the block's height changes with the
  wrap and the card's height changes with the column count, and the worst case is
  not at either end:

  | line | colour | owes | worst (hovered) |
  |---|---|---|---|
  | title (`.contact__panel-title`) | `--salt` | 3:1 | 11.78:1 |
  | number (`.contact__panel-call`) | `--salt` | 3:1 | 12.71:1 |

  Both are bold at `--step-1` / `--step-0`, so both owe 3:1 and clear it four
  times over. There used to be a third line here — a `--step--1` "Εντός ωραρίου"
  label in `--wood-light`, the only small text on the cards, which owed 4.5:1 and
  measured 5.19:1 at its worst. It is gone with the two-number layout, and its
  figure is worth keeping only as a warning: it is the one that came within
  0.7 of failing, and any small or tinted text put back on these cards inherits
  that margin, not the comfortable one the salt lines have.

  **The gradient stops are lengths (`rem`), not percentages, and that is what
  makes the figures above hold at every width.** They were percentages when the
  card carried a single title. The block is a title over a number — a fixed
  number of pixels tall *whatever the card is* — while a percentage ramp scales
  with the card, so a short card pushes the same text further up a thinner part
  of the scrim. Measured on the percentage version, the small label read 5.05:1
  at 1366px and **3.49:1 at 390px**, a fail that only appeared at one width. In
  lengths the dense end simply covers the text block (8rem clears it on every
  card size) and the ramp finishes at 16rem, so a tall card shows *more*
  photograph than the percentage version did and a short one is scrimmed further
  up — which is correct, because on a short card the text really does cover more
  of the picture.

  **The ramp came down from 11rem/21rem when the cards became controls**, and
  that is the maintenance rule rather than a one-off: the block lost a row when
  the two numbers collapsed into one, and the cards got smaller, so the old ramp
  was greying picture that no longer had any text over it. Re-measure the block
  and move the first two stops with it whenever a line is added or removed.

  **The stacked layout is square, and that is a consequence of the fixed-height
  scrim rather than a separate design choice.** Below 48rem `.contact__panel`
  goes `4/3` → `1/1`. A 4:3 panel at 390px is 261px tall, and a fixed ~150px
  block plus its scrim took about two-thirds of it — the table setting was barely
  there. A square is 350px at the same width and gives that back. Above 48rem the
  panels are side by side and 4:3 is the wider, better frame, so the switch is
  where the column count changes. Both panels move together; see the note on the
  4:3 compromise for why they must.
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

  That is why anything sizing it by **height** pays for the field: at 80px tall
  the file wants 142px of width to show an 80px mark. `prepare-favicons.mjs` deals
  with it by trimming to the badge and normalising to 512×512 before cropping —
  every box in that script is measured against the normalised square, not the
  file's own pixels.

  **The nav deals with it without a second asset.** `.nav__logo` is a square box
  — 5rem on the full bar, 3rem on the collapsed one — with `object-fit: cover`,
  which shows the central 940px of the source: the whole 888px badge with 26px
  to spare each side. The field is cropped away for
  free, the mark fills the box, and the bar reuses the asset the hero has already
  loaded instead of a trimmed copy that would need regenerating whenever the logo
  changes. This works *because* the badge is horizontally centred; a replacement
  logo that is off-centre will crop wrong, silently, and look like sloppy
  cropping rather than like a geometry change. Re-measure before trusting it.

  **The crop also makes `sizes` lie, deliberately.** srcset picks a candidate
  from the img's *layout* width, but cover throws away 47% of this file, so a
  file served at the box's own width renders a mark 56% of that size. Nav.astro
  passes `sizes="142px"` with `widths={[142, 284]}` — 80 × 1672/940 and its 2x —
  which is the width that fills the box, not the width the box measures. Resize
  `.nav__logo` and both numbers move with it.

  **The disc stays inside the bar, and that was tested the hard way.** Hanging it
  half out — the treatment on thyme-restaurant-bar-nafplio.gr, whose 180px badge
  sits in a 94px bar with 106px below it — was built at 11rem and reverted. It is
  mechanically fine (`align-self: start` and a negative `margin-block-end` hold
  the bar at 97px, and .nav has no `overflow` to shear it). It fails on content:
  this bar is opaque and sticky over three black bands, so the disc covered the
  opening words of a Team paragraph on scroll, and at the top of the homepage it
  put a second fokia badge 6px above the hero logo — the page h1, the same mark.
  The reference has no hero logo and centres its badge over an empty column, so
  it pays neither cost. Do not rebuild it without solving those two.
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
