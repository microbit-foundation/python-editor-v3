/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { indentBy, removeCommonIndent } from "./indent";

describe("indentBy", () => {
  it("indents", () => {
    expect(indentBy("foo\nbar\n", "")).toEqual("foo\nbar\n");
    expect(indentBy("  foo\nbar", "  ")).toEqual("    foo\n  bar");
  });

  it("has somewhat weird blank line behaviour", () => {
    // We indent empty lines too, even the last. Could be worth revisiting.
    expect(indentBy("foo\n\n", "  ")).toEqual("  foo\n  \n  ");
  });
});

describe("removeCommonIndent", () => {
  it("does nothing if no indent to remove", () => {
    expect(removeCommonIndent("")).toEqual("");
    expect(removeCommonIndent("foo")).toEqual("foo");
    expect(removeCommonIndent("foo\nbar\n")).toEqual("foo\nbar\n");
    expect(removeCommonIndent("foo\nbar")).toEqual("foo\nbar");
  });

  it("removes common indent", () => {
    expect(removeCommonIndent("  two\n    four\n      six")).toEqual(
      "two\n  four\n    six"
    );
    expect(removeCommonIndent("      six\n  two\n    four")).toEqual(
      "    six\ntwo\n  four"
    );
  });

  it("doesn't count blank lines", () => {
    expect(removeCommonIndent("  foo\n\n  bar\n")).toEqual("foo\n\nbar\n");
  });

  it("still affects blank lines", () => {
    expect(removeCommonIndent("    foo\n  \n    bar\n")).toEqual(
      "foo\n\nbar\n"
    );
  });
});
