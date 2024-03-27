/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Extract } from "./common";

export type Position = [number, number];

// Avoid lodash in the worker
export const sortByStart = (positions: Position[]): Position[] => {
  const copy = [...positions];
  copy.sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0));
  return copy;
};

/**
 * Return text or matches covering the string from start to end.
 *
 * @param positions The match positions.
 * @param text The text.
 * @returns The string divided into extracts.
 */
export const fullStringExtracts = (
  positions: Position[],
  text: string
): Extract[] => {
  const result: Extract[] = [];
  let start = 0;
  sortByStart(positions).forEach((p) => {
    const before: Extract = {
      extract: text.substring(start, p[0]),
      type: "text",
    };
    const match: Extract = {
      extract: text.substring(p[0], p[0] + p[1]),
      type: "match",
    };
    if (before.extract.length) {
      result.push(before);
    }
    result.push(match);
    start = p[0] + p[1];
  });
  const remainder: Extract = {
    extract: text.substring(start),
    type: "text",
  };
  if (remainder.extract.length) {
    result.push(remainder);
  }
  return result;
};

/**
 * Return extracts from the text with contextual information either side.
 *
 * @param positions The match positions.
 * @param text The text.
 * @returns Extracts from the text giving context to the matches.
 */
export const contextExtracts = (
  positions: Position[],
  text: string
): Extract[] => {
  if (positions.length === 0) {
    // Fallback if only text in the title (or id for Reference section) is matched.
    const end = forward(text, 1);
    return [
      {
        type: "text",
        extract: text.slice(0, end + 1),
      },
    ];
  }
  // Find the text around the first match.
  // Highlight all positions within it.
  const p0 = positions[0];
  const start = backward(text, p0[0]);
  const end = forward(text, p0[0] + p0[1]);
  return fullStringExtracts(
    positions
      .filter((p) => p[0] >= start && p[0] + p[1] <= end)
      .map((p): Position => {
        return [p[0] - start, p[1]];
      }),
    text.slice(start, end + 1)
  );
};

const isSeparator = (c: string): boolean => {
  switch (c) {
    case ".":
    case ":":
    case ";":
    case "!":
      return true;
    default:
      return false;
  }
};

const isMicrobitColon = (text: string, offset: number): boolean =>
  text.slice(offset - 5, offset + 4) === "micro:bit";

/**
 * Returns the offset of the first character to include.
 * We do not include the separator.
 */
export const backward = (text: string, offset: number) => {
  while (offset > 0) {
    const previous = text.charAt(offset - 1);
    if (isSeparator(previous) && !isMicrobitColon(text, offset - 1)) {
      break;
    }
    offset--;
  }
  return offset;
};

/**
 * Return the offset of the last character to include.
 * We include the separator.
 */
export const forward = (text: string, offset: number) => {
  while (offset < text.length - 1) {
    const next = text.charAt(offset + 1);
    if (isSeparator(next) && !isMicrobitColon(text, offset + 1)) {
      return offset + 1;
    }
    offset++;
  }
  return offset;
};
