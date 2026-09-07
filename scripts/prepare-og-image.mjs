/**
 * Generates the Open Graph share card, public/og-image.jpg. Re-run only if the
 * photo below or the logo changes:
 *
 *   node scripts/prepare-og-image.mjs
 *
 * A committed build artifact, like the favicons: social crawlers fetch it as a
 * plain static file and never run Astro's image pipeline, so it cannot be a
 * <Picture /> variant. It is the hero's own construction at 1200x630 — a
 * carousel frame, a bottom-weighted scrim, and the wordmark painted from a
 * token rather than baked into a file.
 *
 * One card for every page and every locale; og:title and og:description carry
 * what differs.
 */
import { writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The darkest of the four carousel frames, chosen for that rather than for
 * being the best photograph: this card is a contrast problem wearing a picture.
 * dsc-2857 was tried first and puts a blown-white cocktail behind the "k" — see
 * the measurement this script prints, which is what settled it.
 */
const PHOTO = join(root, 'src/assets/photos/carousel/dsc-2900.jpg');

/** The trimmed horizontal lockup — the same asset the hero masks. */
const WORDMARK = join(root, 'src/assets/photos/backgrounds/logo-wordmark.png');

const DEST = join(root, 'public/og-image.jpg');

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * --salt, not the --light-stone the hero paints this same mark: there it sits on
 * --black at 6.55:1, here on a photograph, where light stone is a mid grey and
 * so is a concrete tabletop. It measured 1.35:1 at its worst pixel.
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
  alpha channel: a flat stone rectangle is given that alpha as its own, which
  paints the mark in the token colour without the file carrying it. Tinting the
  white pixels instead would bake --light-stone into a binary.
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
   Verification, printed rather than assumed: sample every pixel the mark
   occupies, never the mean — the mean runs comfortable while one blown
   highlight behind a letter fails, which is what dsc-2857 did. Measured on the
   scrimmed card before the mark is composited. og:image owes WCAG nothing, but
   a wordmark nobody can read in a timeline defeats the card, so 3:1 is the bar.
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
