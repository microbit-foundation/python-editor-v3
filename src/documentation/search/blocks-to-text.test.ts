/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { PortableText } from "../../common/sanity";
import { blocksToText } from "./blocks-to-text";

const content: PortableText[] = [
  [
    {
      _key: "41931367cb0c",
      _type: "block",
      children: [
        {
          _key: "9456b32ef66c",
          _type: "span",
          marks: [],
          text: "You can put loops inside loops. This is called 'nesting'.",
        },
      ],
      markDefs: [],
      style: "normal",
    },
    {
      _key: "e2f97e66811e",
      _type: "block",
      children: [
        {
          _key: "390d9249602a",
          _type: "span",
          marks: [],
          text: "This program uses a nested loop to light the LED display one pixel at a time by iterating through the rows (y) and the columns (x) inside each row:",
        },
      ],
      markDefs: [],
      style: "normal",
    },
  ],
  [
    {
      _key: "41931367cb0c",
      _type: "block",
      children: [
        {
          _key: "9456b32ef66c",
          _type: "span",
          marks: [],
          text: "You can put loops inside loops. This is called 'nesting'.",
        },
      ],
      markDefs: [],
      style: "normal",
    },
    {
      _type: "python",
      main: "from microbit import *\n\n\nfor y in range(5):\n    for x in range(5):\n        display.set_pixel(x, y, 9)\n        sleep(50)",
    },
    {
      _type: "python",
      main: "from microbit import *\n\n\nfor y in range(5):\n    for x in range(5):\n        display.set_pixel(x, y, 9)\n        sleep(50)",
    },
  ],
];

const expectedResults = [
  "You can put loops inside loops. This is called 'nesting'.\n\nThis program uses a nested loop to light the LED display one pixel at a time by iterating through the rows (y) and the columns (x) inside each row:",
  "You can put loops inside loops. This is called 'nesting'.\n\n\n\n",
];

describe("Sanity blocks to test utility", () => {
  it("returns text correctly from PortableToolkitText", () => {
    const result = blocksToText(content[0]);
    expect(result).toEqual(expectedResults[0]);
  });

  // It actually converts non-block content to an empty string
  // which effectively adds two newline characters to the result.
  it("ignores non-block content", () => {
    const result = blocksToText(content[1]);
    expect(result).toEqual(expectedResults[1]);
  });

  it("returns an empty string if passed arg is an empty array", () => {
    const result = blocksToText([]);
    expect(result).toEqual("");
  });

  it("returns an empty string f passed arg is undefined", () => {
    const result = blocksToText(undefined);
    expect(result).toEqual("");
  });
});
