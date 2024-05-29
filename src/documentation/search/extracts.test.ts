/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  backward,
  contextExtracts,
  forward,
  Position,
  sortByStart,
} from "./extracts";

describe("contextExtracts", () => {
  it("walks forwards to end", () => {
    expect(contextExtracts([[0, 5]], "match more text")).toEqual([
      {
        type: "match",
        extract: "match",
      },
      {
        type: "text",
        extract: " more text",
      },
    ]);
  });
  it("walks backwards to start", () => {
    expect(contextExtracts([[10, 5]], "more text match")).toEqual([
      {
        type: "text",
        extract: "more text ",
      },
      {
        type: "match",
        extract: "match",
      },
    ]);
  });
  it("walks forwards to separator", () => {
    expect(
      contextExtracts([[0, 5]], "match more text. Even more text.")
    ).toEqual([
      {
        type: "match",
        extract: "match",
      },
      {
        type: "text",
        extract: " more text.",
      },
    ]);
  });
  it("walks backwards to separator", () => {
    expect(
      contextExtracts([[26, 5]], "Even more text. More text match")
    ).toEqual([
      {
        type: "text",
        extract: " More text ",
      },
      {
        type: "match",
        extract: "match",
      },
    ]);
  });
  it("special-cases micro:bit", () => {
    expect(contextExtracts([[10, 5]], "micro:bit match micro:bit")).toEqual([
      {
        type: "text",
        extract: "micro:bit ",
      },
      {
        type: "match",
        extract: "match",
      },
      {
        type: "text",
        extract: " micro:bit",
      },
    ]);
  });
  it("highlights all matches in returned text", () => {
    expect(
      contextExtracts(
        [
          [0, 5], // Extract chosen based on this one
          [6, 5], // Included as inside
          [13, 5], // Omitted
        ],
        "match match. match"
      )
    ).toEqual([
      {
        type: "match",
        extract: "match",
      },
      {
        type: "text",
        extract: " ",
      },
      {
        type: "match",
        extract: "match",
      },
      {
        type: "text",
        extract: ".",
      },
    ]);
  });
  it("excluded match isn't returned", () => {
    const text = `Integers are whole numbers.\n\nThis will create an integer variable called a:`;
    const positions: Position[] = [
      [0, 8],
      [49, 7],
    ];
    expect(contextExtracts(positions, text)).toEqual([
      {
        type: "match",
        extract: "Integers",
      },
      {
        type: "text",
        extract: " are whole numbers.",
      },
      // Previous bug was an empty match here.
    ]);
  });
  it("returns the first sentence without matches if no positions are provided", () => {
    expect(contextExtracts([], "First sentence. Second sentence.")).toEqual([
      {
        type: "text",
        extract: "First sentence.",
      },
    ]);
  });
});

describe("sortByStart", () => {
  it("sorts by first (start) position in pair", () => {
    expect(
      sortByStart([
        [5, 10],
        [99, 1],
        [1, 20],
      ])
    ).toEqual([
      [1, 20],
      [5, 10],
      [99, 1],
    ]);
  });
});

describe("forward", () => {
  it("stops when expected", () => {
    expect(forward("foo", 0)).toEqual(2);
    expect(forward("foo.", 0)).toEqual(3);
    expect(forward("", 0)).toEqual(0);
    expect(forward(".", 0)).toEqual(0);
  });
});

describe("backward", () => {
  it("stops when expected", () => {
    expect(backward("foo", 3)).toEqual(0);
    expect(backward(".foo", 3)).toEqual(1);
    expect(backward("", 0)).toEqual(0);
    expect(backward(".", 1)).toEqual(1);
  });
});
