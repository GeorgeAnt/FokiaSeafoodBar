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
 * The photograph on the Take away band's events card.
 *
 * Deliberately NOT in gallery/ or gallery.json: it is used in one place, the
 * client did not want it as a gallery tile, and a file in gallery/ without a
 * JSON entry would be reported by npm run check as "not shown on the site",
 * which would be false. sections/ is walked by nothing.
 *
 * It carries no alt anywhere: the note cards are <details>, so this sits inside
 * a <summary> and any alt would be read as part of the control's name.
 *
 * The client's file is 68% black bars. "sushi events.jpg" arrives 1920x1080 but
 * the picture is a 608x1080 portrait frame pillarboxed into 16:9. Measured by
 * pixel scan — the bars are pure black, so a threshold-based crop detector
 * reports the whole frame. Regenerate from the original with:
 *   sharp('<original>')
 *     .rotate()
 *     .extract({ left: 656, top: 0, width: 608, height: 1080 })
 *     .resize(2560, 2560, { fit: 'inside', withoutEnlargement: true })
 *     .jpeg({ quality: 88, mozjpeg: true })
 */
export { default as sushiEvents } from '../assets/photos/sections/sushi-events.jpg';

/**
 * The badge, transparent outside the circle. It carries the nav and the footer,
 * and scripts/prepare-favicons.mjs generates the icons from it. The old opaque
 * 512px square went with the nav logo it existed for.
 */
export { default as logoClean } from '../assets/photos/backgrounds/logo-clean.png';

/**
 * The horizontal wordmark lockup, used as the hero's h1.
 *
 * Derived from the client's LOGO-01.png, a 4725x4725 canvas holding a 4725x2770
 * mark: trimmed to the artwork and resized to 600px wide. THE TRIM IS THE POINT
 * — the hero renders this as a CSS mask, and a mask sized contain would fit the
 * square canvas and leave ~41% of the box as empty field.
 *
 * Regenerate with, from the repo root:
 *   sharp('src/assets/photos/backgrounds/LOGO-01.png')
 *     .trim({ threshold: 1 }).resize({ width: 600 }).png()
 *
 * The artwork is pure white on transparency, so the shape is entirely in the
 * alpha channel — which is what a mask reads.
 */
export { default as logoWordmark } from '../assets/photos/backgrounds/logo-wordmark.png';
