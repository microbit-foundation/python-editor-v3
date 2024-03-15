/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * @vitest-environment jsdom
 */
import { PortableText } from "../../common/sanity";
import { decorateWithCollapseNodes } from "./collapse-util";
import { DocumentationCollapseMode } from "./DocumentationContent";

describe("decorateWithCollapseNodes", () => {
  it("copes with empty inputs", () => {
    expect(
      decorateWithCollapseNodes(
        undefined,
        DocumentationCollapseMode.ExpandCollapseExceptCode
      )
    ).toEqual([]);
    expect(
      decorateWithCollapseNodes(
        [],
        DocumentationCollapseMode.ExpandCollapseExceptCode
      )
    ).toEqual([]);
  });
  it("A", () => {
    const content: PortableText = [blockA];
    expect(
      decorateWithCollapseNodes(
        content,
        DocumentationCollapseMode.ExpandCollapseExceptCode
      )
    ).toEqual([
      {
        _type: "collapse",
        children: [blockA],
        collapseToFirstLine: false,
      },
    ]);
  });
  it("A (collapseFirst)", () => {
    const content: PortableText = [blockA];
    expect(
      decorateWithCollapseNodes(
        content,
        DocumentationCollapseMode.ExpandCollapseExceptCodeAndFirstLine
      )
    ).toEqual([
      {
        _type: "collapse",
        children: [blockA],
        collapseToFirstLine: true,
      },
    ]);
  });
  it("A, B (collapseFirst)", () => {
    const content: PortableText = [blockA, blockB];
    expect(
      decorateWithCollapseNodes(
        content,
        DocumentationCollapseMode.ExpandCollapseExceptCodeAndFirstLine
      )
    ).toEqual([
      {
        _type: "collapse",
        children: [blockA, blockB],
        collapseToFirstLine: true,
      },
    ]);
  });
  it("A, python", () => {
    const content: PortableText = [blockA, python];
    expect(
      decorateWithCollapseNodes(
        content,
        DocumentationCollapseMode.ExpandCollapseExceptCode
      )
    ).toEqual([
      {
        _type: "collapse",
        children: [blockA],
        collapseToFirstLine: false,
      },
      python,
    ]);
  });
  it("python, B (collapseFirst)", () => {
    const content: PortableText = [python, blockB];
    expect(
      decorateWithCollapseNodes(
        content,
        DocumentationCollapseMode.ExpandCollapseExceptCodeAndFirstLine
      )
    ).toEqual([
      python,
      {
        _type: "collapse",
        children: [blockB],
        collapseToFirstLine: false,
      },
    ]);
  });
});

const blockA = {
  _type: "block",
  children: [
    {
      _type: "span",
      marks: [],
      text: "A",
    },
  ],
  markDefs: [],
  style: "normal",
};

const blockB = {
  _type: "block",
  children: [
    {
      _type: "span",
      marks: [],
      text: "B",
    },
  ],
  markDefs: [],
  style: "normal",
};

const python = {
  _type: "python",
  main: "from microbit import *\n\n\nfor y in range(5):\n    for x in range(5):\n        display.set_pixel(x, y, 9)\n        sleep(50)",
};
