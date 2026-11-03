/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * A promise settled from outside, for a value that one party waits on and
 * another supplies later.
 */
export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

export const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
