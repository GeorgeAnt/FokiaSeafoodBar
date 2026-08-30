/**
 * One-time photo preparation.
 *
 * The client's originals are ~4-13 MB each at 3712x5568 — far too heavy to keep
 * in the repo. This downsamples them once to a sane master size; Astro's
 * <Picture /> then generates the actual responsive AVIF/WebP variants at build
 * time from these masters.
 *
 * Originals are never modified and never committed. Re-run only when the client
 * sends new photos:
 *
 *   node scripts/prepare-photos.mjs
 */
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'C:/Users/KEOGE/Documents/wetransfer_fokia-reviewed_2026-08-27_1446';
const DEST = 'src/assets/photos';

/** Source subfolder -> destination subfolder. */
const FOLDERS = {
  carousel: 'carousel',
  gallery: 'gallery',
  'meet the team': 'team',
};

const MAX_EDGE = 2560;
const QUALITY = 88;

/** `Chef John.jpeg` -> `chef-john`, `DSC_9858(1).jpeg` -> `dsc_9858-1` */
function slugify(filename) {
  return basename(filename, extname(filename))
    .toLowerCase()
    .replace(/\((\d+)\)/g, '-$1')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

let totalIn = 0;
let totalOut = 0;

for (const [srcFolder, destFolder] of Object.entries(FOLDERS)) {
  const srcDir = join(SOURCE, srcFolder);
  const destDir = join(DEST, destFolder);
  await mkdir(destDir, { recursive: true });

  const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  console.log(`\n${srcFolder} -> ${destFolder} (${files.length} files)`);

  for (const file of files) {
    const from = join(srcDir, file);
    const to = join(destDir, `${slugify(file)}.jpg`);

    const { size: inSize } = await stat(from);
    const info = await sharp(from)
      .rotate() // honour EXIF orientation before we strip it
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(to);

    totalIn += inSize;
    totalOut += info.size;
    const pct = ((1 - info.size / inSize) * 100).toFixed(0);
    console.log(
      `  ${file.padEnd(20)} -> ${basename(to).padEnd(22)} ` +
        `${info.width}x${info.height}  ` +
        `${(inSize / 1e6).toFixed(1)}MB -> ${(info.size / 1e6).toFixed(2)}MB  (-${pct}%)`
    );
  }
}

console.log(
  `\nTotal: ${(totalIn / 1e6).toFixed(0)} MB -> ${(totalOut / 1e6).toFixed(1)} MB ` +
    `(-${((1 - totalOut / totalIn) * 100).toFixed(0)}%)`
);
