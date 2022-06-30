import { PortableText } from "../../common/sanity";
import { decorateWithCollapseNodes } from "./collapse-util";

describe("decorateWithCollapseNodes", () => {
  it("copes with empty inputs", () => {
    expect(decorateWithCollapseNodes(undefined, false)).toEqual([]);
    expect(decorateWithCollapseNodes([], false)).toEqual([]);
  });
  it("A", () => {
    const content: PortableText = [blockA];
    expect(decorateWithCollapseNodes(content, false)).toEqual([
      {
        _type: "collapse",
        children: [blockA],
        collapseToFirstLine: false,
      },
    ]);
  });
  it("A (collapseFirst)", () => {
    const content: PortableText = [blockA];
    expect(decorateWithCollapseNodes(content, true)).toEqual([
      {
        _type: "collapse",
        children: [blockA],
        collapseToFirstLine: true,
      },
    ]);
  });
  it("A, B (collapseFirst)", () => {
    const content: PortableText = [blockA, blockB];
    expect(decorateWithCollapseNodes(content, true)).toEqual([
      {
        _type: "collapse",
        children: [blockA, blockB],
        collapseToFirstLine: true,
      },
    ]);
  });
  it("A, python", () => {
    const content: PortableText = [blockA, python];
    expect(decorateWithCollapseNodes(content, false)).toEqual([
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
    expect(decorateWithCollapseNodes(content, true)).toEqual([
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
