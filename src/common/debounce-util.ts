/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Returns a function that delays calling fn until waitMs have elapsed
 * since the last call, invoking it with the most recent arguments.
 */
export const debounce = <A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number
): ((...args: A) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), waitMs);
  };
};
