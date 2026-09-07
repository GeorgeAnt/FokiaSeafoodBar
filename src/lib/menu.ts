/**
 * Menu data access and price formatting.
 *
 * Menu strings are locale-keyed and flattened by lib/i18n.ts. `volume` is the
 * one field that stays a plain string: "250 ml" reads the same either way.
 * Price formatting is deliberately locale-independent — Greek convention
 * throughout, matching the client's printed menu.
 */
import foodData from '../data/menu-food.json';
import drinksData from '../data/menu-drinks.json';

export interface LocalizedText {
  el: string;
  en: string;
}

export interface Wine {
  producer?: LocalizedText;
  label?: LocalizedText;
  grape?: LocalizedText;
  style?: LocalizedText;
}

export interface MenuItem {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  /** null = the client has not priced this item yet. Renders as an em dash; never dropped. */
  price: number | null;
  unit?: LocalizedText;
  volume?: string;
  variants?: LocalizedText[];
  wine?: Wine;
  tags?: string[];
}

export interface MenuGroup {
  id: string;
  name: LocalizedText;
  /** Applies to every item in the group, e.g. "6 τεμάχια" / "6 pieces". */
  unit?: LocalizedText;
  items?: MenuItem[];
  subcategories?: MenuGroup[];
}

export const foodCategories = foodData.categories as MenuGroup[];
export const drinkCategories = drinksData.categories as MenuGroup[];

/**
 * Greek convention: comma decimal, euro sign after the number. Whole numbers
 * stay whole (9 €, not 9,00 €); cents keep both digits (2,50 €, never 2,5 €).
 */
export function formatPrice(price: number): string {
  const text = Number.isInteger(price) ? String(price) : price.toFixed(2).replace('.', ',');
  return `${text} €`;
}
