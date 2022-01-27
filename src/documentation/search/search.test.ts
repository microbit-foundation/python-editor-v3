/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ApiDocsResponse } from "../../language-server/apidocs";
import { Toolkit } from "../explore/model";
import { IndexMessage } from "./common";
import {
  SearchableContent,
  buildSearchIndex,
  SearchWorker,
  buildToolkitIndex,
} from "./search";

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
          title: [
            {
              extract: "Indentations",
              type: "text",
            },
          ],
          content: [
            {
              extract: "Python",
              type: "match",
            },
            {
              extract: " uses inde…imes. The ",
              type: "text",
            },
            {
              extract: "'Python'",
              type: "match",
            },
            {
              extract: " line is n…",
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
          title: [
            {
              extract: "While loops: ",
              type: "text",
            },
            {
              extract: "infinite",
              type: "match",
            },
          ],
          content: [
            {
              extract: "…often use ",
              type: "text",
            },
            {
              extract: "infinite",
              type: "match",
            },
            {
              extract: " loops to …",
              type: "text",
            },
          ],
        },
      },
    ]);
  });
});

describe("buildToolkitIndex", () => {
  it("uses language from the toolkit for the Explore index", async () => {
    const reference: ApiDocsResponse = {};
    const toolkitEn: Toolkit = {
      id: "explore",
      description: "description",
      language: "en",
      name: "Explore",
      contents: [
        {
          name: "that is a stopword (literally)",
          compatibility: ["microbitV1", "microbitV2"],
          slug: { _type: "slug", current: "topic" },
          subtitle: "Topic subtitle",
        },
      ],
    };
    const toolkitFr: Toolkit = {
      ...toolkitEn,
      language: "fr",
    };
    const enIndex = await buildToolkitIndex(toolkitEn, reference);
    expect(enIndex.search("topic").explore.length).toEqual(1);
    // "that" is an English stopword
    expect(enIndex.search("that").explore.length).toEqual(0);

    const frIndex = await buildToolkitIndex(toolkitFr, reference);
    expect(frIndex.search("topic").explore.length).toEqual(1);
    // "that" is not a French stopword
    expect(frIndex.search("that").explore.length).toEqual(1);
  });
});

describe("SearchWorker", () => {
  it("blocks queries on initialization", async () => {
    const postMessage = jest.fn();
    const ctx = {
      postMessage,
    } as unknown as Worker;

    new SearchWorker(ctx);

    ctx.onmessage!(
      new MessageEvent("message", {
        data: {
          kind: "query",
          query: "hey",
        },
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(postMessage.mock.calls).toEqual([]);

    const indexMessage: IndexMessage = {
      kind: "index",
      explore: {
        id: "explore",
        description: "Explore stuff",
        name: "Explore",
        contents: [],
        language: "en",
      },
      reference: {},
    };
    ctx.onmessage!(
      new MessageEvent("message", {
        data: indexMessage,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(postMessage.mock.calls).toEqual([
      [{ explore: [], reference: [], kind: "queryResponse" }],
    ]);
  });

  it("reindexes", async () => {
    const postMessage = jest.fn();
    const ctx = {
      postMessage,
    } as unknown as Worker;

    new SearchWorker(ctx);

    const emptyIndex: IndexMessage = {
      kind: "index",
      explore: {
        id: "explore",
        description: "Explore stuff",
        name: "Explore",
        contents: [],
        language: "en",
      },
      reference: {},
    };
    const fullIndex: IndexMessage = {
      kind: "index",
      explore: {
        id: "explore",
        description: "Explore stuff",
        name: "Explore",
        contents: [
          {
            name: "Hello",
            subtitle: "Hello",
            slug: { _type: "slug", current: "hello" },
            compatibility: [],
          },
        ],
        language: "en",
      },
      reference: {},
    };

    const queryHello = async () => {
      return ctx.onmessage!(
        new MessageEvent("message", {
          data: {
            kind: "query",
            query: "hello",
          },
        })
      );
    };
    await ctx.onmessage!(
      new MessageEvent("message", {
        data: emptyIndex,
      })
    );
    await queryHello();
    await ctx.onmessage!(
      new MessageEvent("message", {
        data: fullIndex,
      })
    );
    await queryHello();

    expect(postMessage.mock.calls.length).toEqual(2);
    expect(postMessage.mock.calls[0][0].explore.length).toEqual(0);
    expect(postMessage.mock.calls[1][0].explore.length).toEqual(1);
  });
});
