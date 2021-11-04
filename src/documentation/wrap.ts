/**
 * Adds zero-width spaces around periods to allow line breaking.
 *
 * @param text The text.
 * @returns The text with
 */
export const allowWrapAtPeriods = (text: string) =>
  text.replace(/\./g, "\u200b.\u200b");
