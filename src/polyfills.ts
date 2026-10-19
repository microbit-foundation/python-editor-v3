/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
// Remove when we drop Safari < 15.4.
// Also seen helping some v old Chrome but not reasonable to maintain support here past when we drop older Safari.
export function at<T>(this: ArrayLike<T>, index: number): T | undefined {
  const i = Math.trunc(index) || 0;
  return this[i < 0 ? this.length + i : i];
}

for (const proto of [Array.prototype, String.prototype]) {
  if (!(proto as { at?: unknown }).at) {
    Object.defineProperty(proto, "at", {
      value: at,
      writable: true,
      configurable: true,
    });
  }
}
