/**
 * Is the restaurant open at a given moment?
 *
 * Pure and timezone-free on purpose: the caller decides which clock the day and
 * the minutes came from. Contact.astro reads them in Europe/Athens, because the
 * question "is the kitchen open" is about the restaurant's clock and not the
 * visitor's — someone calling from London at 22:00 is calling a place where it
 * is already midnight.
 *
 * Kept here rather than inline in the component so the shipped logic is the
 * logic that gets tested; a copy in a test file would be free to drift.
 */

export type HoursEntry = {
  /** schema.org day names, as written in site.json. */
  days: string[];
  /** "HH:MM" */
  opens: string;
  /** "HH:MM". "00:00" means the end of the day, not the start of one. */
  closes: string;
};

const YESTERDAY: Record<string, string> = {
  Monday: 'Sunday',
  Tuesday: 'Monday',
  Wednesday: 'Tuesday',
  Thursday: 'Wednesday',
  Friday: 'Thursday',
  Saturday: 'Friday',
  Sunday: 'Saturday',
};

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * @param day     Day name in the restaurant's timezone, e.g. "Tuesday".
 * @param minutes Minutes since midnight in the restaurant's timezone.
 */
export function isOpenAt(entries: HoursEntry[], day: string, minutes: number): boolean {
  return entries.some((entry) => {
    const opens = toMinutes(entry.opens);
    const closes = toMinutes(entry.closes);

    if (entry.days.includes(day)) {
      // A close time that is not after the open time runs to midnight. "00:00"
      // is what this site actually uses and it means 24:00, so an entry of
      // 16:00–00:00 covers 16:00 up to but not including midnight.
      const endsToday = closes > opens ? closes : 24 * 60;
      if (minutes >= opens && minutes < endsToday) return true;
    }

    // A genuinely overnight range — closes strictly before it opens and not at
    // midnight, e.g. 20:00–02:00 — also covers the small hours of the next day.
    if (closes < opens && closes > 0 && entry.days.includes(YESTERDAY[day])) {
      if (minutes < closes) return true;
    }

    return false;
  });
}
