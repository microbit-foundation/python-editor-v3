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
  it("captures examples", () => {
    expect(splitDocString("Summary\n\nExample: `Foo`\n\nRemainder\n\nMore remainder")).toEqual({
      summary: "Summary",
      example: "Foo",
      remainder: "Remainder\n\nMore remainder"
    })
  })
});
