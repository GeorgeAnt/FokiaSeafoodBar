/**
 * One-time video preparation for the Take away events card.
 *
 * Astro does not process video the way <Picture /> processes images — there is
 * no variant generation and no content hash — so the encoded files are written
 * straight into `public/video/` and served verbatim. This script is the only
 * record of how they were made.
 *
 * Originals are never modified and never committed. Re-run when the client
 * sends a new cut:
 *
 *   npm run video
 *
 * Needs ffmpeg on PATH (`winget install Gyan.FFmpeg`). It is not a
 * devDependency: like `prepare-photos.mjs`, this reads a SOURCE outside the
 * repo and so cannot run on a fresh clone anyway.
 *
 * ---------------------------------------------------------------------------
 * WHY THE CROP IS THE WHOLE POINT
 *
 * The source the client supplied is a 720x720 H.264 file, which looks like a
 * perfect fit for the card's 1:1 media box. It is not. Measured by scanning the
 * pixels (the bars are pure black, luminance 0.0, so cropdetect's default
 * threshold reports the full frame): the actual picture is **228x406 at
 * x=246, y=157** — a portrait phone clip pillar- and letterboxed into a square,
 * with **82% of every frame black**.
 *
 * Two consequences, and the second is the expensive one:
 *
 * - Dropped in uncropped, the card would show a small portrait video floating
 *   in a black field. Cropping is not an optimisation here, it is the fix.
 * - Nearly all of the source's 2.1 Mbps was spent encoding black. Cropping
 *   first is why the output below is a fraction of the input with no visible
 *   loss: the bitrate goes into picture instead.
 *
 * **The resolution is a real limitation and no encoder setting can fix it.**
 * The card's media box renders 432 CSS px at 1366 and 346 at 390, so a 228px
 * source is upscaled 1.89x on desktop and 3.04x on a dpr-2 phone. Beside the
 * sourcing card — a sharp crop of a 1152x2560 master — it reads soft. If a
 * better master ever arrives (the phone original would be 1080x1920), point
 * SOURCE at it, re-run, and re-measure CONTENT below; everything else here
 * still applies.
 *
 * Output is encoded at the content's **native** size rather than upscaled to
 * the card's box. Upscaling in the encode bakes in the blur and spends bytes
 * without adding detail; letting the browser scale costs nothing and looks the
 * same.
 * ---------------------------------------------------------------------------
 */
import { mkdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';

const run = promisify(execFile);

const SOURCE = 'C:/Users/KEOGE/Downloads/sushi events.mp4';
const DEST = 'public/video';
const NAME = 'sushi-events';

/**
 * The real picture inside the padded 720x720 frame, measured by pixel scan.
 * Stable from t≈2s; the first second is a transition and is trimmed off below.
 */
const CONTENT = { x: 246, y: 157, w: 228, h: 406 };

/**
 * Square, because the card's media box is 1:1 and cropping here rather than in
 * CSS means the delivered file contains only what is actually shown — 44% of
 * the portrait frame's height is cropped away either way, so there is no reason
 * to ship it. Taken from the middle of the content box.
 */
const SIDE = CONTENT.w;
const CROP = {
  w: SIDE,
  h: SIDE,
  x: CONTENT.x,
  y: CONTENT.y + Math.round((CONTENT.h - SIDE) / 2),
};

/**
 * **Under five seconds, and that is an accessibility requirement rather than a
 * size decision.** WCAG 2.2.2 applies to movement that starts automatically,
 * lasts more than five seconds and sits alongside other content — which is
 * exactly this card. Below five seconds it does not apply, so the clip needs no
 * pause control. This site already carries one knowing 2.2.2 failure (the hero
 * carousel, whose stop button was removed on request); this is deliberately not
 * a second one.
 *
 * **Both ends were chosen by looking, and the end matters more than the start**,
 * because the clip plays once and then *holds its last frame* — that frame is
 * what the card is from then on, so it is really a still photograph that
 * happens to be arrived at.
 *
 * - Start 0.8s: t=0 is a glitched teal transition frame. 0.8 opens on a gloved
 *   hand setting a roll down, which is the only moment in the clip with a
 *   person in it.
 * - End 4.8s: the pan reaches its widest, densest view of the finished trays.
 *   Everything after it tightens onto two plates and then **fades to black** —
 *   the source's last frames are literally black, so a window running to the
 *   end would hold an empty card.
 */
const START = 0.8;
const DURATION = 4.0;

/**
 * **One codec, and that is a measured decision rather than laziness.** The
 * usual advice — ship VP9 or AV1 first and keep H.264 as the fallback — assumes
 * a video big enough for the percentage to be worth a second file. This one is
 * not. Encoded from the same crop and trim:
 *
 *   h264 crf 24  134 KB     vp9 crf 34  127 KB
 *   h264 crf 26  107 KB     vp9 crf 38   96 KB
 *   h264 crf 28   86 KB     vp9 crf 42   73 KB
 *
 * At matched quality VP9 saves about 10 KB, which does not pay for a second
 * file in the repo, a second `<source>`, and a second encoder to keep tuned.
 * H.264 alone also needs no fallback reasoning: every browser takes it.
 *
 * CRF 28 rather than 26 because the three were compared frame-for-frame,
 * upscaled to the card's rendered 432px, and are indistinguishable — the
 * source's own softness dominates any difference the encoder makes, so the
 * cheaper setting is free. Do not push past 30: blocking survives the upscale
 * in a way that blur does not.
 */
const H264 = ['-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

/**
 * `-an` drops the AAC track and `-dn` the timecode track. Autoplay only works
 * muted, so the audio was 256 kbps of guaranteed dead weight — and dropping it
 * removes any chance of a card making a noise at someone.
 */
const STRIP = ['-an', '-dn', '-sn', '-map_metadata', '-1'];

const filter = `crop=${CROP.w}:${CROP.h}:${CROP.x}:${CROP.y}`;

async function ffmpeg(args) {
  try {
    await run('ffmpeg', args, { maxBuffer: 1 << 26 });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        'ffmpeg is not on PATH. Install it with `winget install Gyan.FFmpeg` ' +
          'and open a new shell, then re-run `npm run video`.'
      );
    }
    throw err;
  }
}

const mb = (n) => `${(n / 1e6).toFixed(2)} MB`;

await mkdir(DEST, { recursive: true });
const { size: inSize } = await stat(SOURCE);

console.log(`source        ${SOURCE}`);
console.log(`  frame       720x720, of which ${CONTENT.w}x${CONTENT.h} is picture (${((CONTENT.w * CONTENT.h) / (720 * 720) * 100).toFixed(0)}%)`);
console.log(`  crop        ${filter}`);
console.log(`  trim        ${START}s .. ${(START + DURATION).toFixed(1)}s  (${DURATION}s, under the WCAG 2.2.2 five-second floor)`);
console.log(`  in          ${mb(inSize)}\n`);

const outputs = [];

const mp4 = join(DEST, `${NAME}.mp4`);
await ffmpeg(['-y', '-ss', String(START), '-t', String(DURATION), '-i', SOURCE, '-vf', filter, ...H264, ...STRIP, mp4]);
outputs.push(mp4);

/**
 * The poster is the **first** frame of the trimmed clip, not the best one.
 * A prettier still would jump-cut the moment playback started; continuity wins,
 * and this is also the still a `prefers-reduced-motion` visitor keeps, since
 * they never get the play.
 */
const poster = join(DEST, `${NAME}-poster.jpg`);
await ffmpeg(['-y', '-ss', String(START), '-i', SOURCE, '-vf', filter, '-frames:v', '1', '-q:v', '4', poster]);
outputs.push(poster);

let totalOut = 0;
for (const file of outputs) {
  const { size } = await stat(file);
  totalOut += size;
  console.log(`  ${file.padEnd(34)} ${mb(size)}`);
}

console.log(
  `\ntotal ${mb(inSize)} -> ${mb(totalOut)} ` +
    `(-${((1 - totalOut / inSize) * 100).toFixed(0)}%), output ${CROP.w}x${CROP.h}\n` +
    `NB public/ is not content-hashed. A re-encode keeps the same URL, so a\n` +
    `visitor may hold the old file until their cache expires — bump NAME if a\n` +
    `change has to reach everyone immediately.`
);
