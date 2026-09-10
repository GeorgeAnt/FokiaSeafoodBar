/**
 * The privacy notice's content, typed.
 *
 * privacy.json mixes paragraphs and lists in one `body` array, and the type
 * TypeScript infers for a mixed JSON array does not narrow on `'list' in block`
 * — hence the explicit shape rather than the raw import.
 */
import data from '../data/privacy.json';
import type { LocalizedText } from './menu';

/** A paragraph, or a bulleted list of items. */
export type PrivacyBlock = LocalizedText | { list: LocalizedText[] };

export interface PrivacySection {
  id: string;
  heading: LocalizedText;
  body: PrivacyBlock[];
}

export const privacy = data as {
  /** YYYY-MM-DD. */
  updated: string;
  controller: { heading: LocalizedText; intro: LocalizedText; name: LocalizedText };
  sections: PrivacySection[];
};
