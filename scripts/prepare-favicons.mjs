/**
 * Generates the favicons from the client's logo.
 *
 *   node scripts/prepare-favicons.mjs
 *
 * Re-run only if the logo changes. Two pieces of artwork, on purpose:
 *
 *   Tab icons use the wave-in-the-o monogram. The full badge is unreadable at
 *   16px — the wordmark and "SEAFOOD BAR" collapse into a grey smudge — while
 *   the monogram still reads as a distinct mark at every size.
 *
 *   The Apple touch icon uses the whole badge, because iOS renders it large on
 *   the home screen where the wordmark is legible and more recognisable.
 *
 * The .ico is written by hand rather than pulling in a dependency: the format
 * is a 6-byte header, one 16-byte entry per image, and then the images. Every
 * browser that still asks for favicon.ico accepts PNG payloads inside it.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'src/assets/photos/logo.png');
const DEST = join(root, 'public');

/**
 * The monogram, cropped out of the 512x512 badge. Slightly wider than the mark
 * itself so the waves are not flush against the edge at small sizes.
 */
const MONOGRAM = { left: 92, top: 217, width: 136, height: 136 };

const monogram = (size) =>
  sharp(SOURCE).extract(MONOGRAM).resize(size, size, { fit: 'cover' }).png();

/** Packs already-encoded PNGs into an ICO container. */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

await mkdir(DEST, { recursive: true });

const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
  icoImages.push({ size, data: await monogram(size).toBuffer() });
}
await writeFile(join(DEST, 'favicon.ico'), buildIco(icoImages));
console.log(`favicon.ico            ${icoSizes.join(', ')}px  (monogram)`);

await monogram(96).toFile(join(DEST, 'favicon-96x96.png'));
console.log('favicon-96x96.png      96px  (monogram)');

// iOS puts this on a white or coloured tile, so the badge keeps its own
// background rather than being made transparent.
await sharp(SOURCE).resize(180, 180, { fit: 'cover' }).png().toFile(join(DEST, 'apple-touch-icon.png'));
console.log('apple-touch-icon.png   180px (full badge)');

// Astro's starter favicon is not ours.
await rm(join(DEST, 'favicon.svg'), { force: true });
console.log('\nremoved the default favicon.svg');
