/**
 * Resolves the filenames stored in the JSON data files to the actual image
 * modules, so that content can be edited without touching imports.
 *
 * The masters under src/assets/photos/ are produced once by
 * scripts/prepare-photos.mjs; <Picture /> derives the responsive AVIF/WebP
 * variants from them at build time.
 */
import type { ImageMetadata } from 'astro';

type Modules = Record<string, { default: ImageMetadata }>;

const carousel = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/carousel/*.jpg',
  { eager: true }
) as Modules;

const gallery = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/photos/gallery/*.jpg',
  { eager: true }
) as Modules;

const team = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/team/*.jpg', {
  eager: true,
}) as Modules;

function pick(modules: Modules, folder: string, file: string): ImageMetadata {
  const found = modules[`../assets/photos/${folder}/${file}`];
  if (!found) {
    throw new Error(
      `Photo "${file}" is referenced in the JSON data but is missing from ` +
        `src/assets/photos/${folder}/. Available: ${Object.keys(modules)
          .map((k) => k.split('/').pop())
          .join(', ')}`
    );
  }
  return found.default;
}

export const galleryPhoto = (file: string) => pick(gallery, 'gallery', file);
export const teamPhoto = (file: string) => pick(team, 'team', file);

/** The client's own four picks for the hero, in filename order. */
export const carouselPhotos: ImageMetadata[] = Object.keys(carousel)
  .sort()
  .map((k) => carousel[k]!.default);

/**
 * The badge, transparent outside the circle. It carries the nav and the footer,
 * and scripts/prepare-favicons.mjs generates the icons from it. The old opaque
 * 512px square went with the nav logo it existed for.
 */
export { default as logoClean } from '../assets/photos/backgrounds/logo-clean.png';

/**
 * The horizontal wordmark lockup — "fokia" with the wave motif, SEAFOOD BAR
 * under it — used as the hero's h1.
 *
 * Derived from the client's LOGO-01.png, which is a 4725x4725 canvas holding a
 * 4725x2770 mark: trimmed to the artwork and resized to 600px wide. The trim is
 * the point. The hero renders this as a CSS *mask* so the colour comes from
 * --light-stone rather than from the file, and a mask sized `contain` would
 * otherwise fit the square canvas and leave ~41% of the box as empty field
 * above and below the mark.
 *
 * Regenerate with, from the repo root:
 *   sharp('src/assets/photos/backgrounds/LOGO-01.png')
 *     .trim({ threshold: 1 }).resize({ width: 600 }).png()
 *
 * The artwork is pure white (255,255,255) on transparency, so the shape lives
 * entirely in the alpha channel — which is exactly what a mask reads.
 */
export { default as logoWordmark } from '../assets/photos/backgrounds/logo-wordmark.png';
