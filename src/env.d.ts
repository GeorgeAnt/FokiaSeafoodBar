/// <reference types="astro/client" />

/**
 * The language switcher's public surface, defined by the inline script in
 * src/layouts/Base.astro. It exists because the section scripts build controls
 * by cloning a <template>, and template content is a separate document fragment
 * the switcher's querySelectorAll pass cannot see.
 *
 * Optional, and always called with ?.: a control must still work if the inline
 * script never loaded.
 */
interface FokiaI18n {
  /** Re-applies the current locale over the whole document, clones included. */
  refresh(): void;
  /** Points an element at a different label key and resolves it immediately. */
  setLabelKey(el: Element, key: string): void;
}

interface Window {
  fokiaI18n?: FokiaI18n;
}
