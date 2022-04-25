/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { splitDocString } from "./docstrings";

describe("splitDocString", () => {
  it("splits first para from remainder", () => {
    const { summary, remainder } = splitDocString(
      "Frobs the wibble\n\nFurther information\n\nOn multiple lines\n"
    );
    expect(summary).toEqual("Frobs the wibble");
    expect(remainder).toEqual("Further information\n\nOn multiple lines\n");
  });
  it("returns undefined if no remainder", () => {
    const { summary, remainder } = splitDocString("Frobs the wibble");
    expect(summary).toEqual("Frobs the wibble");
    expect(remainder).toBeUndefined();
  });
  it("returns something for empty string", () => {
    const { summary, remainder } = splitDocString("");
    expect(summary).toEqual("");
    expect(remainder).toBeUndefined();
  });
});
