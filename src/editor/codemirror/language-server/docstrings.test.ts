/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { splitDocString } from "./docstrings";

describe("splitDocString", () => {
  it("splits first para from remainder", () => {
    const [first, remainder] = splitDocString(
      "Frobs the wibble\n\nFurther information\n\nOn multiple lines\n"
    );
    expect(first).toEqual("Frobs the wibble");
    expect(remainder).toEqual("Further information\n\nOn multiple lines\n");
  });
  it("returns undefined if no remainder", () => {
    const [first, remainder] = splitDocString("Frobs the wibble");
    expect(first).toEqual("Frobs the wibble");
    expect(remainder).toBeUndefined();
  });
  it("returns something for empty string", () => {
    const [first, remainder] = splitDocString("");
    expect(first).toEqual("");
    expect(remainder).toBeUndefined();
  });
});
