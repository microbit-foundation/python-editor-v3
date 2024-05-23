/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import multi from "lunr-languages/lunr.multi";
import stemmerSupport from "lunr-languages/lunr.stemmer.support";
import tinyseg from "lunr-languages/tinyseg";
import lunr from "lunr";
import { splitDocString } from "../../editor/codemirror/language-server/docstrings";
import type {
  ApiDocsEntry,
  ApiDocsResponse,
} from "../../language-server/apidocs";
import type { Toolkit, ToolkitTopic } from "../reference/model";
import { blocksToText } from "./blocks-to-text";
import {
  Extracts,
  IndexMessage,
  QueryMessage,
  Result,
  SearchResults,
} from "./common";
import { Position, contextExtracts, fullStringExtracts } from "./extracts";

export const supportedSearchLanguages = [
  "de",
  "en",
  "es-es",
  "fr",
  "nl",
  "ja",
  "ko",
];

// Supress warning issued when changing languages.
const lunrWarn = lunr.utils.warn;
lunr.utils.warn = (message: string) => {
  if (!message.includes("Overwriting existing registered function")) {
    lunrWarn(message);
  }
};

stemmerSupport(lunr);
multi(lunr);
// Required for Ja stemming support.
tinyseg(lunr);

const ignoredPythonStopWords = new Set([
  // Sorted.
  "and",
  "else",
  "for",
  "if",
  "not",
  "or",
  "while",
]);
const originalStopWordFilter = lunr.stopWordFilter;
lunr.stopWordFilter = (token) => {
  if (ignoredPythonStopWords.has(token.toString())) {
    return token;
  }
  return originalStopWordFilter(token);
};
lunr.Pipeline.registerFunction(lunr.stopWordFilter, "pythonStopWordFilter");

interface Metadata {
  [match: string]: MatchMetadata;
}
interface MatchMetadata {
  [field: string]: { position: Position[] };
}

export class SearchIndex {
  constructor(
    private contentByRef: Map<string, SearchableContent>,
    public index: lunr.Index,
    private tokenizer: TokenizerFunction,
    private tab: "reference" | "api"
  ) {}

  search(text: string): Result[] {
    const results = this.index.query((builder) => {
      this.tokenizer(text).forEach((token) => {
        builder.term(token.toString(), {});
      });
    });
    return results.map((result) => {
      const content = this.contentByRef.get(result.ref);
      if (!content) {
        throw new Error("Missing content");
      }
      const matchMetadata = result.matchData.metadata as Metadata;
      const extracts = getExtracts(matchMetadata, content);
      return {
        id: content.id,
        title: content.title,
        containerTitle: content.containerTitle,
        navigation: {
          tab: this.tab,
          slug: { id: content.id },
        },
        extract: extracts,
      };
    });
  }
}

const getExtracts = (
  matchMetadata: Metadata,
  content: SearchableContent
): Extracts => {
  const allContentPositions: Position[] = [];
  const allTitlePositions: Position[] = [];

  for (const match of Object.values(matchMetadata)) {
    if (match.title) {
      match.title.position.forEach((p) => {
        allTitlePositions.push(p);
      });
    }
    if (match.content) {
      match.content.position.forEach((p) => {
        allContentPositions.push(p);
      });
    }
  }

  return {
    title: fullStringExtracts(allTitlePositions, content.title),
    content: contextExtracts(allContentPositions, content.content),
  };
};

export class LunrSearch {
  constructor(private reference: SearchIndex, private api: SearchIndex) {}

  search(text: string): SearchResults {
    return {
      reference: this.reference.search(text),
      api: this.api.search(text),
    };
  }
}

export interface SearchableContent {
  id: string;
  /**
   * The API module or Reference topic.
   */
  containerTitle: string;
  title: string;
  content: string;
}

const defaultString = (string: string | undefined): string => {
  return string || "";
};

const referenceSearchableContent = (
  reference: Toolkit
): SearchableContent[] => {
  const content: SearchableContent[] = [];
  reference.contents?.forEach((t) => {
    if (!isSingletonTopic(t)) {
      content.push({
        id: t.slug.current,
        title: t.name,
        containerTitle: t.name,
        content: t.subtitle + ". " + blocksToText(t.introduction),
      });
    }
    t.contents?.forEach((e) => {
      content.push({
        id: e.slug.current,
        title: e.name,
        containerTitle: t.name,
        content: [
          blocksToText(e.content),
          blocksToText(e.detailContent),
          defaultString(e.alternativesLabel),
          defaultString(e.alternatives?.map((a) => a.name).join(", ")),
        ].join(" "),
      });
    });
  });
  return content;
};

const apiSearchableContent = (
  toolkit: ApiDocsResponse
): SearchableContent[] => {
  const content: SearchableContent[] = [];
  const addNestedDocs = (
    moduleName: string,
    entries: ApiDocsEntry[] | undefined
  ): void => {
    entries?.forEach((c) => {
      content.push({
        id: c.id,
        title: c.fullName.substring(moduleName.length + 1),
        containerTitle: moduleName,
        content: splitDocString(defaultString(c.docString)).summary,
      });
      addNestedDocs(moduleName, c.children);
    });
  };
  for (const module of Object.values(toolkit)) {
    content.push({
      id: module.id,
      title: module.fullName,
      containerTitle: module.fullName,
      content: splitDocString(defaultString(module.docString)).summary,
    });
    addNestedDocs(module.fullName, module.children);
  }
  return content;
};

type TokenizerFunction = {
  (obj?: string | object | object[] | null | undefined): lunr.Token[];
  separator: RegExp;
};

export const buildSearchIndex = (
  searchableContent: SearchableContent[],
  tab: "reference" | "api",
  language: LunrLanguage | undefined,
  languagePlugin: lunr.Builder.Plugin,
  ...plugins: lunr.Builder.Plugin[]
): SearchIndex => {
  let customTokenizer: TokenizerFunction | undefined;
  const index = lunr(function () {
    this.ref("id");
    this.field("id", {
      boost: 10,
      extractor: (doc: object) => {
        // Ensure we match a search query like 'microbit.display.scroll' or 'display.scroll'
        // to the correct API section.
        return `${(doc as SearchableContent).id} ${(
          doc as SearchableContent
        ).id.replaceAll("microbit.", "")}`;
      },
    });
    this.field("title", { boost: 10 });
    this.field("content");
    this.use(languagePlugin);
    plugins.forEach((p) => this.use(p));

    // If the language defines a tokenizer then we need to us it alongside the
    // English one. We stash the tokenizer in customTokenizer so we can pass it
    // to the index for use at query time.
    const languageTokenizer = language ? lunr[language].tokenizer : undefined;
    customTokenizer = Object.assign(
      (obj?: string | object | object[] | null | undefined) => {
        const tokens = lunr.tokenizer(obj);
        if (!languageTokenizer) {
          return tokens;
        }
        return tokens.concat(languageTokenizer(obj));
      },
      { separator: lunr.tokenizer.separator }
    );
    this.tokenizer = customTokenizer;

    this.metadataWhitelist = ["position"];
    for (const doc of searchableContent) {
      this.add(doc);
    }
  });
  const contentByRef = new Map(searchableContent.map((c) => [c.id, c]));
  return new SearchIndex(contentByRef, index, customTokenizer!, tab);
};

// Exposed for testing.
export const buildIndex = async (
  reference: Toolkit,
  api: ApiDocsResponse,
  lunrLanguage: LunrLanguage | undefined,
  languageSupport: ((l: typeof lunr) => void) | undefined
): Promise<LunrSearch> => {
  const plugins: lunr.Builder.Plugin[] = [];
  if (languageSupport && lunrLanguage) {
    languageSupport(lunr);
    plugins.push(lunr[lunrLanguage]);
  }

  // There is always some degree of English content.
  const multiLanguages = ["en"];
  if (lunrLanguage) {
    multiLanguages.push(lunrLanguage);
  }
  const languagePlugin = lunr.multiLanguage(...multiLanguages);

  return new LunrSearch(
    buildSearchIndex(
      referenceSearchableContent(reference),
      "reference",
      lunrLanguage,
      languagePlugin,
      ...plugins
    ),
    buildSearchIndex(
      apiSearchableContent(api),
      "api",
      lunrLanguage,
      languagePlugin,
      ...plugins
    )
  );
};

type LunrLanguage = "de" | "es" | "fr" | "ja" | "nl" | "ko";

export class SearchWorker {
  private search: LunrSearch | undefined;
  // We block queries on indexing.
  private recordInitialization: (() => void) | undefined;
  private initialized: Promise<void>;

  constructor(
    private ctx: DedicatedWorkerGlobalScope,
    private languageId: LunrLanguage | undefined,
    private languageSupport: ((l: typeof lunr) => void) | undefined
  ) {
    // We return Promises here just to allow for easy testing.
    this.ctx.onmessage = async (event: MessageEvent) => {
      const data = event.data;
      if (data.kind === "query") {
        return this.query(data as QueryMessage);
      } else if (data.kind === "index") {
        return this.index(data as IndexMessage);
      } else if (data.kind === "shutdown") {
        this.ctx.close();
      } else {
        console.error("Unexpected worker message", event);
      }
    };
    this.initialized = new Promise((resolve) => {
      // Later, in response to the index message.
      this.recordInitialization = resolve;
    });
  }

  private async index(message: IndexMessage) {
    this.search = await buildIndex(
      message.reference,
      message.api,
      this.languageId,
      this.languageSupport
    );
    this.recordInitialization!();
  }

  private async query(message: QueryMessage) {
    const search = await this.initializedIndex();
    this.ctx.postMessage({
      kind: "queryResponse",
      ...search.search(message.query),
    });
  }

  private async initializedIndex(): Promise<LunrSearch> {
    await this.initialized;
    return this.search!;
  }
}

// We have some topics that contain a single item with the same id.
// There's no sense indexing the topic itself in those cases.
const isSingletonTopic = (t: ToolkitTopic): boolean =>
  t.contents?.length === 1 && t.contents[0].slug.current === t.slug.current;
