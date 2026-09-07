/**
 * Generates the Open Graph share card, public/og-image.jpg.
 *
 *   node scripts/prepare-og-image.mjs
 *
 * Re-run only if the carousel photo below or the logo changes. Like the
 * favicons, this is a one-time build artifact that IS committed — social
 * crawlers fetch it as a plain static file and never run Astro's image
 * pipeline, so it cannot be a <Picture /> variant.
 *
 * It is the hero's own construction at share-card proportions: a carousel
 * photograph, a bottom-weighted scrim, and the wordmark painted --light-stone.
 * Built rather than hand-cropped for the same reason the hero masks its logo —
 * the colour stays a token, so recolouring the mark is an edit here and not a
 * new file from a designer.
 *
 * 1200x630 is Facebook's and LinkedIn's documented size and satisfies
 * twitter:card=summary_large_image, which the site already declares. It is one
 * card for every page and every locale: og:title and og:description carry what
 * differs, and a locale-specific card would need the whole set regenerated
 * whenever a photograph moved.
 */
import { writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The darkest of the four carousel frames, and chosen for that rather than for
 * being the best photograph: the mark is painted --light-stone, so the card is
 * really a contrast problem wearing a photograph. dsc-2857 was tried first and
 * puts a blown-white cocktail directly behind the "k" — see the measurement the
 * bottom of this script prints, which is what settled it. Filename order is the
 * carousel's own order (see lib/photos.ts).
 */
const PHOTO = join(root, 'src/assets/photos/carousel/dsc-2900.jpg');

/** The trimmed horizontal lockup — the same asset the hero masks. */
const WORDMARK = join(root, 'src/assets/photos/backgrounds/logo-wordmark.png');

const DEST = join(root, 'public/og-image.jpg');

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * --salt, not the --light-stone the hero paints this same mark.
 *
 * The hero sets the wordmark on --black, where light stone is 6.55:1. Here it
 * sits on a photograph, and this site already has a rule for that: stone over a
 * photo is the Take away panels' problem, and those carry --salt for exactly
 * this reason. Light stone measured **1.35:1** at its worst pixel against the
 * concrete tabletop — the script's own check caught it — because it is a mid
 * grey and so is the table.
 */
const SALT = { r: 0xe2, g: 0xe8, b: 0xeb };

/** Mark width as a fraction of the card, and its baseline above the bottom. */
const MARK_WIDTH = Math.round(WIDTH * 0.46);
const MARK_BOTTOM = 96;

/* A factory, not an instance. `composite()` mutates the pipeline it is called
   on, so a single shared instance would hand the verification pass below a
   photo that already had the mark on it — and `clone()` copies the mutation
   too. Each consumer gets its own. */
const photo = () => sharp(PHOTO).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' });

/*
  The scrim. Sharp has no gradient primitive, so it is an SVG overlay — which
  is also why it can be a real gradient rather than the flat wash a `composite`
  with an opacity would give. Weighted to the bottom half, where the mark sits;
  the top stays clear so the photograph is still the picture.
*/
const scrim = Buffer.from(
  `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%"   stop-color="#181414" stop-opacity="0.20"/>
         <stop offset="35%"  stop-color="#181414" stop-opacity="0.62"/>
         <stop offset="70%"  stop-color="#181414" stop-opacity="0.88"/>
         <stop offset="100%" stop-color="#181414" stop-opacity="0.96"/>
       </linearGradient>
     </defs>
     <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#s)"/>
   </svg>`
);

/*
  The artwork is pure white on transparency, so its shape is entirely in the
  alpha channel — exactly what makes the CSS mask work in the hero. Here the
  same property is used the other way round: a flat stone rectangle is given
  the artwork's alpha as its own, which paints the mark in the token colour
  without the file ever carrying it. Tinting the white pixels instead would
  bake --light-stone into a binary, which is the thing this codebase avoids.
*/
const markSource = sharp(WORDMARK).resize({ width: MARK_WIDTH });
const { width: markW, height: markH } = await markSource.png().toBuffer({ resolveWithObject: true })
  .then(({ info }) => info);

const alpha = await markSource.clone().extractChannel('alpha').toBuffer();

const mark = await sharp({
  create: { width: markW, height: markH, channels: 3, background: SALT },
})
  .joinChannel(alpha)
  .png()
  .toBuffer();

const card = await photo()
  .composite([
    { input: scrim, top: 0, left: 0 },
    {
      input: mark,
      left: Math.round((WIDTH - markW) / 2),
      top: HEIGHT - MARK_BOTTOM - markH,
    },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toBuffer();

await writeFile(DEST, card);

/* ---------------------------------------------------------------------------
   Verification, printed rather than assumed.

   The card is a light mark on a photograph, which is the situation CLAUDE.md
   has a standing rule about: sample every pixel the text occupies, never the
   mean. The mean over this box runs comfortable while a single blown highlight
   behind one letter fails, which is exactly what dsc-2857 did.

   Measured on the *scrimmed* card with the mark not yet composited, since what
   the mark has to survive is whatever is left underneath it. og:image has no
   WCAG obligation — it is a picture, not an interface — but a wordmark nobody
   can read in a Facebook timeline is the whole reason the card exists, so the
   3:1 a large graphic owes is the bar used here.
   --------------------------------------------------------------------------- */
const srgb = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const markLum = luminance(SALT.r, SALT.g, SALT.b);
const markLeft = Math.round((WIDTH - markW) / 2);
const markTop = HEIGHT - MARK_BOTTOM - markH;

/* The mark's own alpha is the mask: only pixels the artwork actually paints
   are sampled, so the empty field inside the lockup's letterforms does not
   dilute the reading. */
/* Two passes, not one chained call: sharp applies `extract` before
   `composite`, so chaining them would try to lay the full-size scrim over an
   already-cropped tile and throw. Scrim to a buffer, then crop that. */
const scrimmed = await photo().composite([{ input: scrim, top: 0, left: 0 }]).png().toBuffer();

const behind = await sharp(scrimmed)
  .extract({ left: markLeft, top: markTop, width: markW, height: markH })
  .removeAlpha()
  .raw()
  .toBuffer();

let worst = Infinity;
for (let i = 0; i < markW * markH; i += 1) {
  if (alpha[i] < 128) continue;
  const ratio = contrast(markLum, luminance(behind[i * 3], behind[i * 3 + 1], behind[i * 3 + 2]));
  if (ratio < worst) worst = ratio;
}

const { size } = await stat(DEST);
console.log(`og-image.jpg  ${WIDTH}x${HEIGHT}  ${(size / 1024).toFixed(0)} KB`);
console.log(`wordmark worst single pixel: ${worst.toFixed(2)}:1 (owes 3:1)`);
if (worst < 3) console.warn(`  ^ under 3:1 — darken the scrim or pick another carousel frame`);
