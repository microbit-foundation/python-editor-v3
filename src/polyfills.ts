/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
// `Array.prototype.at` is ES2022: Chrome 92, Safari 15.4, Firefox 90. That is
// above the support floor in vite.config.ts, and esbuild lowers syntax but
// never built-ins, so anything below the floor needs this shim. marked calls
// it while parsing, which takes out the docs panel and language-server hovers
// on affected browsers rather than degrading quietly.
// Exported for tests: the install below is a no-op in any runtime new
// enough to run them, so the arithmetic would otherwise never be exercised.
export function at<T>(this: ArrayLike<T>, index: number): T | undefined {
  const i = Math.trunc(index) || 0;
  return this[i < 0 ? this.length + i : i];
}

for (const proto of [Array.prototype, String.prototype]) {
  if (!(proto as { at?: unknown }).at) {
    // Non-enumerable, matching the native method: a plain assignment would
    // show up in `for...in` over an array.
    Object.defineProperty(proto, "at", {
      value: at,
      writable: true,
      configurable: true,
    });
  }
}
