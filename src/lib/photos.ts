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
 * The badge, transparent outside the circle. The only logo file: it carries the
 * hero and the footer, and scripts/prepare-favicons.mjs generates the icons from
 * it. The old opaque 512px square went with the nav logo it existed for.
 */
export { default as logoClean } from '../assets/photos/logo-clean.png';
