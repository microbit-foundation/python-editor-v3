/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import sortBy from "lodash.sortby";
import lunr from "lunr";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { blocksToText } from "../common/sanity-utils";
import { ApiDocsEntry, ApiDocsResponse } from "../language-server/apidocs";
import { RouterState } from "../router-hooks";
import { State } from "./documentation-hooks";
import { useToolkitState } from "./toolkit-hooks";

export interface Extract {
  extract: string;
  type: string;
}
interface Extracts {
  title: Extract[];
  content: Extract[];
}
export interface Result {
  id: string;
  navigation: RouterState;
  containerTitle: string;
  title: string;
  extract: Extracts;
}

export interface SearchResults {
  explore: Result[];
  reference: Result[];
}

type Position = [number, number];

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

/**
 * Group positions that overlap when extending them by `extensionLength`.
 *
 * @param positions Sorted positions.
 * @param extensionLength The maximum length of text to show either side.
 * @returns The bundled positions.
 */
const bundlePositions = (
  positions: Position[],
  extensionLength: number
): Position[][] => {
  const result: Position[][] = [];
  positions.forEach((p, i) => {
    if (i === 0) {
      result.push([p]);
    } else {
      const previous = result[i - 1];
      const previousEndPos =
        previous[previous.length - 1][0] + previous[previous.length - 1][1];
      if (previousEndPos + extensionLength >= p[0] - extensionLength) {
        // Bundle overlapping positions.
        previous.push(p);
        result.pop();
        result.push(previous);
      } else {
        result.push([p]);
      }
    }
  });
  return result;
};

const sortByStart = (positions: Position[]): Position[] =>
  sortBy(positions, (p) => p[0]);

/**
 * Return text or matches covering the string from start to end.
 *
 * @param positions The match positions.
 * @param text The text.
 * @returns The string divided into extracts.
 */
const fullStringExtracts = (positions: Position[], text: string): Extract[] => {
  const result: Extract[] = [];
  let start = 0;
  sortByStart(positions).forEach((p) => {
    const before = {
      extract: text.substring(start, p[0]),
      type: "text",
    };
    const match = {
      extract: text.substring(p[0], p[0] + p[1]),
      type: "match",
    };
    if (before.extract.length) {
      result.push(before);
    }
    result.push(match);
    start = p[0] + p[1];
  });
  const remainder = {
    extract: text.substring(start),
    type: "text",
  };
  if (remainder.extract.length) {
    result.push(remainder);
  }
  return result;
};

/**
 * Return extracts from the text with contextual information either side.
 *
 * @param positions The match positions.
 * @param text The text.
 * @returns Extracts from the text giving context to the matches.
 */
const contextExtracts = (positions: Position[], text: string): Extract[] => {
  const extensionLength = 10;
  const sortedPositions = sortByStart(positions);
  const bundledPositions: Position[][] = bundlePositions(
    sortedPositions,
    extensionLength
  );
  const results: Extract[] = [];
  bundledPositions.forEach((bundle, bi) => {
    let prevEndPos = 0;
    bundle.forEach((p, pi) => {
      let extractStartPos = p[0] - extensionLength;
      let prefix = "";
      let extractEndPos = p[0] + p[1] + extensionLength;
      let suffix = "";
      if (text) {
        if (pi === 0 && bi === 0) {
          // First item only.
          if (extractStartPos < 0) {
            extractStartPos = 0;
            prefix = "";
          } else {
            prefix = "…";
          }
        }
        if (pi === bundle.length - 1) {
          // Last item or only item.
          if (extractEndPos > text.length - 1) {
            extractEndPos = text.length - 1;
            suffix = "";
          } else {
            suffix = "…";
          }
        }

        extractStartPos = prevEndPos ? prevEndPos : extractStartPos;

        if (pi !== bundle.length - 1) {
          // If there are additional extract parts to add.
          extractEndPos = p[0] + p[1];
          prevEndPos = extractEndPos;
        }

        const preExtract = text.substring(extractStartPos, p[0]);
        const match = text.substring(p[0], p[0] + p[1]);
        const postExtract = text.substring(p[0] + p[1], extractEndPos);

        if (preExtract.length > 0) {
          results.push({
            extract: prefix + preExtract,
            type: "text",
          });
        }
        results.push({ extract: match, type: "match" });
        if (postExtract.length > 0) {
          results.push({
            extract: postExtract + suffix,
            type: "text",
          });
        }
      }
    });
  });
  return results;
};

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
    // Content needs a fallback if only text in the title is matched.
    content: contextExtracts(allContentPositions, content.content),
  };
};

export class Search {
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

const SearchContext = createContext<Search | undefined>(undefined);

export const useSearch = (): Search => {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const validateString = (string: string | undefined): string => {
  return string || "";
};

const getExploreSearchableContent = (state: State): SearchableContent[] => {
  const content: SearchableContent[] = [];
  if (state.status === "ok") {
    state.toolkit.contents?.forEach((t) => {
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
  }
  return content;
};

const getReferenceSearchableContent = (
  toolkit: ApiDocsResponse | undefined
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
        content: validateString(c.docString),
      });
      addNestedDocs(moduleName, c.children);
    });
  };
  if (toolkit) {
    for (const module of Object.values(toolkit)) {
      addNestedDocs(module.fullName, module.children);
    }
  }
  return content;
};

export const buildSearchIndex = (
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

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { exploreToolkit, referenceToolkit } = useToolkitState();

  const value: Search = useMemo(() => {
    const exploreSearchIndex = buildSearchIndex(
      getExploreSearchableContent(exploreToolkit),
      "explore"
    );
    const referenceSearchIndex = buildSearchIndex(
      getReferenceSearchableContent(referenceToolkit),
      "reference"
    );

    return new Search(exploreSearchIndex, referenceSearchIndex);
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
