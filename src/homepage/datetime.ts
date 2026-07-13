/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntlShape } from "react-intl";

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
];

/**
 * Formats a timestamp as a localized relative time, e.g. "3 days ago".
 */
export const timeAgo = (intl: IntlShape, timestamp: number): string => {
  const diff = timestamp - Date.now();
  const abs = Math.abs(diff);
  for (const [unit, ms] of units) {
    if (abs >= ms) {
      return intl.formatRelativeTime(Math.round(diff / ms), unit, {
        numeric: "auto",
      });
    }
  }
  return intl.formatRelativeTime(Math.round(diff / 1000), "second", {
    numeric: "auto",
  });
};
