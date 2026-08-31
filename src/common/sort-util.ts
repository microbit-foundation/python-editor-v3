/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

type Iteratee<T> = (item: T) => string | number | boolean;

/**
 * Returns a copy of the array sorted ascending by the iteratees,
 * comparing by the first iteratee and using the others as tie-breakers.
 * The sort is stable.
 */
export const sortBy = <T>(
  items: readonly T[],
  ...iteratees: Iteratee<T>[]
): T[] =>
  [...items].sort((a, b) => {
    for (const iteratee of iteratees) {
      const left = iteratee(a);
      const right = iteratee(b);
      if (left < right) {
        return -1;
      }
      if (left > right) {
        return 1;
      }
    }
    return 0;
  });
