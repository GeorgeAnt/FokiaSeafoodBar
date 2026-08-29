/**
 * Menu data access and price formatting.
 *
 * Menu strings are Greek in both locales and never translated — see lib/i18n.ts.
 * Only the *formatting* of a price is locale-independent here: Greek convention
 * throughout (comma decimal, trailing euro sign), because the menu is Greek.
 */
import foodData from '../data/menu-food.json';
import drinksData from '../data/menu-drinks.json';

export interface Wine {
  producer?: string;
  label?: string;
  grape?: string;
  style?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  /** null = the client has not priced this item yet. Renders as an em dash; never dropped. */
  price: number | null;
  unit?: string;
  volume?: string;
  variants?: string[];
  wine?: Wine;
  tags?: string[];
}

export interface MenuGroup {
  id: string;
  name: string;
  /** Applies to every item in the group, e.g. "6 τεμάχια | 6 pieces". */
  unit?: string;
  items?: MenuItem[];
  subcategories?: MenuGroup[];
}

export const foodCategories = foodData.categories as MenuGroup[];
export const drinkCategories = drinksData.categories as MenuGroup[];

/**
 * Greek price convention: comma as the decimal separator, euro sign after the
 * number. Whole numbers stay whole (9 €, not 9,00 €) — that is how the client's
 * own menu is written.
 */
export function formatPrice(price: number): string {
  const text = Number.isInteger(price)
    ? String(price)
    : price.toFixed(2).replace('.', ',').replace(/,?0+$/, '');
  return `${text} €`;
}

/** Every item in a group, including items nested in subcategories. */
export function flattenItems(groups: MenuGroup[]): MenuItem[] {
  return groups.flatMap((g) => [
    ...(g.items ?? []),
    ...(g.subcategories ? flattenItems(g.subcategories) : []),
  ]);
}

/** Wine producer / label / grape / style, joined for its own line under the name. */
export function wineLine(wine: Wine): string {
  return [wine.producer, wine.label, wine.style, wine.grape].filter(Boolean).join(' · ');
}

/** Reported at build time so the client can be chased for the missing prices. */
export function unpricedItems(): { category: string; name: string }[] {
  const out: { category: string; name: string }[] = [];
  const walk = (groups: MenuGroup[], trail: string[]) => {
    for (const g of groups) {
      const path = [...trail, g.name];
      for (const item of g.items ?? []) {
        if (item.price === null) out.push({ category: path.join(' / '), name: item.name });
      }
      if (g.subcategories) walk(g.subcategories, path);
    }
  };
  walk(foodCategories, []);
  walk(drinkCategories, []);
  return out;
}
