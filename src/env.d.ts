/// <reference types="astro/client" />

/**
 * The language switcher's public surface, defined by the inline script in
 * `src/layouts/Base.astro`.
 *
 * It exists because the two section scripts build their controls by cloning a
 * `<template>`, and template content is a separate document fragment that the
 * switcher's `document.querySelectorAll` pass cannot see. They call `refresh()`
 * once the clone is in the page, and `setLabelKey()` for a control whose label
 * changes with its state.
 *
 * Optional, and always called with `?.`: the section scripts are ES modules and
 * run after the inline one, but a control must still work if it never loaded.
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
