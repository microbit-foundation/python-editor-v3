/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { escapeRegExp } from "./regexp-util";

describe("escapeRegExp", () => {
  it("escapes special characters", () => {
    const regExp = new RegExp("^" + escapeRegExp(".[]()*+?^$") + "$");
    expect(regExp.test(".[]()*+?^$")).toEqual(true);
    expect(regExp.test("x")).toEqual(false);
  });
  it("leaves other characters alone", () => {
    expect(escapeRegExp("abc_123")).toEqual("abc_123");
  });
  it("matches literal dot only", () => {
    // The autocompletion trigger character case.
    const regExp = new RegExp("[" + escapeRegExp(".") + "]");
    expect(regExp.test(".")).toEqual(true);
    expect(regExp.test("a")).toEqual(false);
  });
});
