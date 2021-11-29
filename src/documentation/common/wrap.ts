/**
 * Adds zero-width spaces around periods to allow line breaking.
 */
export const allowWrapAtPeriods = (text: string) =>
  text.replace(/\./g, "\u200b.\u200b");
