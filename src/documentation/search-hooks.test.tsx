/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Search, SearchableContent, buildSearchIndex } from "./search-hooks";

const searchableExploreContent: SearchableContent[] = [
  {
    id: "indentations",
    title: "Indentations",
    content:
      "Python uses indentations, usually 4 spaces, to show which instructions are inside and outside a loop.\n\nThis program uses a for loop to scroll 'micro:bit' on the LED display 3 times.",
  },
  {
    id: "while-loops-infinite",
    title: "While loops: infinite",
    content:
      "Programs often use infinite loops to keep a program running.\n\nHere the word 'micro:bit' will scroll across the LED display for ever:\n\nThis is a common way to continuously check inputs like sensor readings or if a button has been pressed:\n\n",
  },
  {
    id: "while-loops-conditional",
    title: "While loops: conditional",
    content:
      "While loops keep a block of code running as long as something is true.\n\nAny instructions after the while statement that are indented are included in the loop.\n\nThis loop keeps running while the variable number has a value less than 10. When the value reaches 10, the loop ends, so it will count from 0 to 9:\n\n",
  },
];

const searchableReferenceContent: SearchableContent[] = [
  {
    id: "",
    title: "",
    content: "",
  },
];

describe("Search", () => {
  it("checks that Search class search methods perform adequately", () => {
    const search = new Search(
      buildSearchIndex(searchableExploreContent),
      buildSearchIndex(searchableReferenceContent)
    );

    expect(search.search("python")).toEqual({
      exploreResults: [
        {
          ref: "indentations",
          score: expect.any(Number),
          matchData: {
            metadata: { python: { content: { position: [[0, 6]] } } },
          },
        },
      ],
      referenceResults: [],
    });

    // Results are ordered by score. We can safely assume that two matches ranks higher than one.
    expect(search.search("program")).toEqual({
      exploreResults: [
        {
          ref: "while-loops-infinite",
          score: expect.any(Number),
          matchData: {
            metadata: {
              program: {
                content: {
                  position: [
                    [0, 8],
                    [44, 7],
                  ],
                },
              },
            },
          },
        },
        {
          ref: "indentations",
          score: expect.any(Number),
          matchData: {
            metadata: { program: { content: { position: [[108, 7]] } } },
          },
        },
      ],
      referenceResults: [],
    });
  });
});
