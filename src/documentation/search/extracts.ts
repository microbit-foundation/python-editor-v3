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
  text: string,
  context: number = 10
): Extract[] => {
  if (positions.length === 0) {
    return [];
  }
  const extracts = fullStringExtracts(positions, text);
  return extracts.map((e, index) => {
    const length = e.extract.length;
    if (e.type === "text" && length > context) {
      const first = index === 0;
      const last = index === extracts.length - 1;
      if (first) {
        return {
          type: "text",
          extract: "…" + e.extract.substring(length - context),
        };
      } else if (last) {
        return { type: "text", extract: e.extract.substring(0, context) + "…" };
      } else if (length > context * 2) {
        return {
          type: "text",
          extract:
            e.extract.substring(0, context) +
            "…" +
            e.extract.substring(length - context),
        };
      }
    }
    return e;
  });
};
