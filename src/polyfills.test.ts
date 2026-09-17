/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from "vitest";
import { at } from "./polyfills";

describe("at", () => {
  const call = <T>(target: ArrayLike<T>, index: number) =>
    at.call(target, index) as T | undefined;

  it("indexes from the start", () => {
    expect(call(["a", "b", "c"], 0)).toEqual("a");
    expect(call(["a", "b", "c"], 2)).toEqual("c");
  });

  it("indexes from the end", () => {
    expect(call(["a", "b", "c"], -1)).toEqual("c");
    expect(call(["a", "b", "c"], -3)).toEqual("a");
  });

  it("returns undefined when out of range", () => {
    expect(call(["a"], 1)).toBeUndefined();
    expect(call(["a"], -2)).toBeUndefined();
    expect(call([], -1)).toBeUndefined();
  });

  it("truncates and coerces the index", () => {
    expect(call(["a", "b", "c"], 1.9)).toEqual("b");
    expect(call(["a", "b", "c"], -1.9)).toEqual("c");
    expect(call(["a", "b", "c"], NaN)).toEqual("a");
    expect(call(["a", "b", "c"], undefined as unknown as number)).toEqual("a");
  });

  it("works on strings", () => {
    expect(call("abc", -1)).toEqual("c");
  });
});
