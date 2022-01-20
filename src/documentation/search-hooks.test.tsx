/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SearchableContent, buildSearchIndex } from "./search-hooks";

const searchableExploreContent: SearchableContent[] = [
  {
    id: "indentations",
    title: "Indentations",
    containerTitle: "Loops",
    content:
      "Python uses indentations, usually 4 spaces, to show which instructions are inside and outside a loop.\n\nThis program uses a for loop to scroll 'micro:bit' on the LED display 3 times.\n\nThis program uses a for loop to scroll 'micro:bit' on the LED display 3 times. The 'Python' line is not indented, so it's not in the loop and it only runs once.",
  },
  {
    id: "while-loops-infinite",
    title: "While loops: infinite",
    containerTitle: "Loops",
    content:
      "Programs often use infinite loops to keep a program running.\n\nHere the word 'micro:bit' will scroll across the LED display for ever:\n\nThis is a common way to continuously check inputs like sensor readings or if a button has been pressed:\n\n",
  },
  {
    id: "while-loops-conditional",
    title: "While loops: conditional",
    containerTitle: "Loops",
    content:
      "While loops keep a block of code running as long as something is true.\n\nAny instructions after the while statement that are indented are included in the loop.\n\nThis loop keeps running while the variable number has a value less than 10. When the value reaches 10, the loop ends, so it will count from 0 to 9:\n\n",
  },
];

describe("Search", () => {
  const search = buildSearchIndex(searchableExploreContent, "explore");

  it("finds stuff", () => {
    expect(search.search("python")).toEqual([
      {
        title: "Indentations",
        containerTitle: "Loops",
        id: "indentations",
        navigation: {
          tab: "explore",
          explore: { id: "indentations" },
        },
        extract: {
          formattedTitle: [
            {
              extract: "Indentations",
              type: "text",
            },
          ],
          formattedContent: [
            {
              extract: "",
              type: "text",
            },
            {
              extract: "Python",
              type: "match",
            },
            {
              extract: " uses inde...",
              type: "text",
            },
            {
              extract: "imes. The ",
              type: "text",
            },
            {
              extract: "'Python'",
              type: "match",
            },
            {
              extract: " line is n...",
              type: "text",
            },
          ],
        },
      },
    ]);
  });

  it("ignores stop words", () => {
    expect(search.search("infinite while")).toEqual([
      {
        title: "While loops: infinite",
        containerTitle: "Loops",
        id: "while-loops-infinite",
        navigation: {
          tab: "explore",
          explore: { id: "while-loops-infinite" },
        },
        extract: {
          formattedTitle: [
            {
              extract: "While loops: ",
              type: "text",
            },
            {
              extract: "infinite",
              type: "match",
            },
            {
              extract: "",
              type: "text",
            },
          ],
          formattedContent: [
            {
              extract: "...often use ",
              type: "text",
            },
            {
              extract: "infinite",
              type: "match",
            },
            {
              extract: " loops to ...",
              type: "text",
            },
          ],
        },
      },
    ]);
  });
});
