/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import lunr from "lunr";
import { blocksToText } from "../../common/sanity-utils";
import { ApiDocsEntry, ApiDocsResponse } from "../../language-server/apidocs";
import { Toolkit } from "../explore/model";
import {
  Extracts,
  IndexMessage,
  QueryMessage,
  Result,
  SearchResults,
} from "./common";
import { contextExtracts, fullStringExtracts, Position } from "./extracts";

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
    private tab: "explore" | "reference"
  ) {}

  search(text: string): Result[] {
    const results = this.index.search(
      // TODO: Review escaping and decide what we let through.
      //       Ideally nothing that can cause query errors.
      text.replace(/[~^+:-]/g, (x) => `\\$1`)
    );
    return results.map((result) => {
      const content = this.contentByRef.get(result.ref);
      if (!content) {
        throw new Error("Missing content");
      }
      // eslint-disable-next-line
      const matchMetadata = result.matchData.metadata as Metadata;
      const extracts = getExtracts(matchMetadata, content);
      return {
        id: content.id,
        title: content.title,
        containerTitle: content.containerTitle,
        navigation: {
          tab: this.tab,
          [this.tab]: { id: content.id },
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
    // TODO: consider a fallback if only text in the title is matched.
    content: contextExtracts(allContentPositions, content.content),
  };
};

export class LunrSearch {
  constructor(private explore: SearchIndex, private reference: SearchIndex) {}

  search(text: string): SearchResults {
    return {
      explore: this.explore.search(text),
      reference: this.reference.search(text),
    };
  }
}

export interface SearchableContent {
  id: string;
  /**
   * The Reference module or Explore topic.
   */
  containerTitle: string;
  title: string;
  content: string;
}

const defaultString = (string: string | undefined): string => {
  return string || "";
};

const exploreSearchableContent = (toolkit: Toolkit): SearchableContent[] => {
  const content: SearchableContent[] = [];
  toolkit.contents?.forEach((t) => {
    content.push({
      id: t.slug.current,
      title: t.name,
      containerTitle: t.name,
      content: t.subtitle + ".\n\n" + blocksToText(t.introduction),
    });
    t.contents?.forEach((e) => {
      const contentString = blocksToText(e.content);
      const detailContentString = blocksToText(e.detailContent);
      content.push({
        id: e.slug.current,
        title: e.name,
        containerTitle: t.name,
        content: contentString + detailContentString,
      });
    });
  });
  return content;
};

const referenceSearchableContent = (
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
        content: defaultString(c.docString),
      });
      addNestedDocs(moduleName, c.children);
    });
  };
  for (const module of Object.values(toolkit)) {
    content.push({
      id: module.id,
      title: module.fullName,
      containerTitle: module.fullName,
      content: defaultString(module.docString),
    });
    addNestedDocs(module.fullName, module.children);
  }
  return content;
};

const buildSearchIndex = (
  searchableContent: SearchableContent[],
  tab: "explore" | "reference"
): SearchIndex => {
  const index = lunr(function () {
    this.ref("id");
    this.field("title", { boost: 10 });
    this.field("content");
    this.metadataWhitelist = ["position"];
    for (const doc of searchableContent) {
      this.add(doc);
    }
  });
  const contentByRef = new Map(searchableContent.map((c) => [c.id, c]));
  return new SearchIndex(contentByRef, index, tab);
};

const buildToolkitIndex = (
  exploreToolkit: Toolkit,
  referenceToolkit: ApiDocsResponse
): LunrSearch => {
  return new LunrSearch(
    buildSearchIndex(exploreSearchableContent(exploreToolkit), "explore"),
    buildSearchIndex(referenceSearchableContent(referenceToolkit), "reference")
  );
};

export class SearchWorker {
  private current: LunrSearch | undefined;
  // We block queries on the first indexing.
  private recordInitialization: (() => void) | undefined;
  private initialized: Promise<void>;

  constructor(private ctx: Worker) {
    this.ctx.onmessage = async (event: MessageEvent) => {
      const data = event.data;
      if (data.kind === "query") {
        this.query(data as QueryMessage);
      } else if (data.kind === "index") {
        this.index(data as IndexMessage);
      } else {
        console.error("Unexpected worker message", event);
      }
    };
    this.initialized = new Promise((resolve) => {
      // Later, in response to the index message.
      this.recordInitialization = resolve;
    });
  }

  private index(message: IndexMessage) {
    this.current = buildToolkitIndex(message.explore, message.reference);
    this.recordInitialization!();
  }

  private async query(message: QueryMessage) {
    const search = await this.currentIndex();
    this.ctx.postMessage({
      kind: "queryResponse",
      ...search.search(message.query),
    });
  }

  private async currentIndex(): Promise<LunrSearch> {
    await this.initialized;
    return this.current!;
  }
}
