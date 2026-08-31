/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { nameFromSignature, removeFullyQualifiedName } from "./names";

describe("removeFullyQualifiedName", () => {
  it("strips module prefix keeping the signature", () => {
    expect(removeFullyQualifiedName("microbit.display.scroll(text)")).toEqual(
      "scroll(text)"
    );
  });
  it("leaves unqualified names alone", () => {
    expect(removeFullyQualifiedName("sleep(ms)")).toEqual("sleep(ms)");
  });
  it("copes with empty parameter list", () => {
    expect(removeFullyQualifiedName("microbit.reset()")).toEqual("reset()");
  });
});

describe("nameFromSignature", () => {
  it("returns the fully qualified name", () => {
    expect(nameFromSignature("microbit.display.scroll(text)")).toEqual(
      "microbit.display.scroll"
    );
  });
  it("returns the name for unqualified signatures", () => {
    expect(nameFromSignature("sleep(ms)")).toEqual("sleep");
  });
});
