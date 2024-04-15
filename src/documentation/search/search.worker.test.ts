/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import lunr from "lunr";
import { ApiDocsResponse } from "../../language-server/apidocs";
import { Toolkit } from "../reference/model";
import { IndexMessage } from "./common";
import lunrJa from "lunr-languages/lunr.ja";
import {
  buildIndex,
  buildSearchIndex,
  SearchableContent,
  SearchWorker,
} from "./search.worker";
import { vi } from "vitest";
import frLanguageSupport from "lunr-languages/lunr.fr";

const searchableReferenceContent: SearchableContent[] = [
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

const searchableReferenceContentJa: SearchableContent[] = [
  {
    id: "",
    title: "",
    containerTitle: "",
    content: "この文章は日本語で書かれています",
  },
];

describe("Search", () => {
  const languagePlugin = lunr.multiLanguage("en");
  const search = buildSearchIndex(
    searchableReferenceContent,
    "reference",
    undefined,
    languagePlugin
  );

  it("finds stuff", () => {
    expect(search.search("python")).toEqual([
      {
        title: "Indentations",
        containerTitle: "Loops",
        id: "indentations",
        navigation: {
          tab: "reference",
          slug: { id: "indentations" },
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
              extract:
                " uses indentations, usually 4 spaces, to show which instructions are inside and outside a loop.",
              type: "text",
            },
          ],
        },
      },
    ]);
  });

  it("ignores stop words except Python ones", () => {
    expect(search.search("which").length).toEqual(0);

    expect(search.search("while").length).toEqual(2);
  });
});

describe("buildReferenceIndex", () => {
  it("uses language support provided", async () => {
    // We used to derive this from the index and dynamically load the right language support
    // inside the worker, but switched to a worker per language when movign to Vite
    const api: ApiDocsResponse = {};
    const referenceEn: Toolkit = {
      id: "reference",
      description: "description",
      language: "en",
      name: "Reference",
      contents: [
        {
          name: "that is a stopword (literally)",
          compatibility: ["microbitV1", "microbitV2"],
          slug: { _type: "slug", current: "topic" },
          subtitle: "Topic subtitle",
        },
      ],
    };
    const referenceFr: Toolkit = {
      ...referenceEn,
      language: "fr",
    };
    const enIndex = await buildIndex(referenceEn, api, undefined, undefined);
    expect(enIndex.search("topic").reference.length).toEqual(1);
    // "that" is an English stopword
    expect(enIndex.search("that").reference.length).toEqual(0);

    const frIndex = await buildIndex(referenceFr, api, "fr", frLanguageSupport);
    expect(frIndex.search("topic").reference.length).toEqual(1);
    // "that" is not a French stopword
    expect(frIndex.search("that").reference.length).toEqual(1);
  });
});

describe("SearchWorker", () => {
  it("blocks queries on initialization", async () => {
    const postMessage = vi.fn();
    const ctx = {
      postMessage,
    } as unknown as DedicatedWorkerGlobalScope;

    new SearchWorker(ctx, undefined, undefined);

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
      reference: {
        id: "reference",
        description: "Reference stuff",
        name: "Reference",
        contents: [],
        language: "en",
      },
      api: {},
    };
    ctx.onmessage!(
      new MessageEvent("message", {
        data: indexMessage,
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(postMessage.mock.calls).toEqual([
      [{ reference: [], api: [], kind: "queryResponse" }],
    ]);
  });

  it("reindexes", async () => {
    const postMessage = vi.fn();
    const ctx = {
      postMessage,
    } as unknown as DedicatedWorkerGlobalScope;

    new SearchWorker(ctx, undefined, undefined);

    const emptyIndex: IndexMessage = {
      kind: "index",
      reference: {
        id: "reference",
        description: "Reference stuff",
        name: "Reference",
        contents: [],
        language: "en",
      },
      api: {},
    };
    const fullIndex: IndexMessage = {
      kind: "index",
      reference: {
        id: "reference",
        description: "Reference stuff",
        name: "Reference",
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
      api: {},
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
    expect(postMessage.mock.calls[0][0].reference.length).toEqual(0);
    expect(postMessage.mock.calls[1][0].reference.length).toEqual(1);
  });
});

describe("Search in Japanese", () => {
  const plugins: lunr.Builder.Plugin[] = [];
  lunrJa(lunr);
  plugins.push((lunr as any)["ja"]);
  const languagePluginJa = lunr.multiLanguage("en", "ja");

  const search = buildSearchIndex(
    searchableReferenceContentJa,
    "reference",
    "ja",
    languagePluginJa,
    ...plugins
  );

  it("matches Japanese characters", () => {
    expect(search.search("書か").length).toEqual(1);
  });

  it("matches Japanese characters with spaces between", () => {
    expect(search.search("書か れ").length).toEqual(1);
  });

  it("matches Japanese characters with no spaces between", () => {
    expect(search.search("この文章は日本語").length).toEqual(1);
  });
});
