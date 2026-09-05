/**
 * Menu data access and price formatting.
 *
 * Menu strings are locale-keyed the same way team.json's are — see lib/i18n.ts,
 * which flattens `name` / `description` / `unit` / variants / wine fields into
 * the same dictionary the rest of the site's chrome uses. `volume` is the one
 * field that stays a plain string: "250 ml" reads the same in either language.
 * Only the *formatting* of a price is locale-independent here: Greek convention
 * throughout (comma decimal, trailing euro sign), because the euro sign and the
 * client's own printed prices don't change with the language toggle.
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
  /** Applies to every item in the group, e.g. "6 τεμάχια | 6 pieces". */
  unit?: LocalizedText;
  items?: MenuItem[];
  subcategories?: MenuGroup[];
}

export const foodCategories = foodData.categories as MenuGroup[];
export const drinkCategories = drinksData.categories as MenuGroup[];

/**
 * Greek price convention: comma as the decimal separator, euro sign after the
 * number. Matches how the client's own menu is written — whole numbers stay
 * whole (9 €, not 9,00 €), and anything with cents keeps both digits
 * (2,50 € and 3,90 €, never 2,5 € or 3,9 €).
 */
export function formatPrice(price: number): string {
  const text = Number.isInteger(price) ? String(price) : price.toFixed(2).replace('.', ',');
  return `${text} €`;
}
