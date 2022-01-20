/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import lunr from "lunr";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { blocksToText } from "../common/sanity-utils";
import { ApiDocsEntry, ApiDocsResponse } from "../language-server/apidocs";
import { RouterState } from "../router-hooks";
import { State } from "./documentation-hooks";
import { useToolkitState } from "./toolkit-hooks";

interface Extract {
  extract: string;
  type: string;
}
interface Extracts {
  formattedTitle: Extract[];
  formattedContent: Extract[];
}
export interface Result {
  id: string;
  navigation: RouterState;
  containerTitle: string;
  title: string;
  extract?: Extracts;
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

const bundlePositions = (
  positions: Position[],
  extensionLength: number
): Position[][] => {
  const bundledPositions: Position[][] = [];
  positions.forEach((p, i) => {
    if (i === 0) {
      bundledPositions.push([p]);
    } else {
      const previousBundleIndex = bundledPositions.length - 1;
      const previousBundle = bundledPositions[previousBundleIndex];
      const previousEndPos =
        previousBundle[previousBundle.length - 1][0] +
        previousBundle[previousBundle.length - 1][1];
      if (previousEndPos + extensionLength >= p[0] - extensionLength) {
        // Bundle overlapping positions.
        previousBundle.push(p);
        bundledPositions.pop();
        bundledPositions.push(previousBundle);
      } else {
        bundledPositions.push([p]);
      }
    }
  });
  return bundledPositions;
};

const sortPositions = (positions: Position[]): Position[] => {
  return positions.sort((a, b) => {
    return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
  });
};

const getTitleExtractArray = (
  allTitlePositions: Position[],
  title: string
): Extract[] => {
  const sortedPositions = sortPositions(allTitlePositions);
  const titleExtractArray: Extract[] = [];
  let previousEndPos = 0;
  sortedPositions.forEach((p) => {
    titleExtractArray.push({
      extract: title.substring(previousEndPos, p[0]),
      type: "text",
    });
    titleExtractArray.push({
      extract: title.substring(p[0], p[0] + p[1]),
      type: "match",
    });
    previousEndPos = p[0] + p[1];
  });
  titleExtractArray.push({
    extract: title.substring(previousEndPos),
    type: "text",
  });
  return titleExtractArray;
};

const getContentExtractArray = (
  allContentPositions: Position[],
  content: string
): Extract[] => {
  const extensionLength = 10;
  const sortedContentPositions = sortPositions(allContentPositions);
  const bundledPositions: Position[][] = bundlePositions(
    sortedContentPositions,
    extensionLength
  );
  const contentExtractArray: Extract[] = [];
  bundledPositions.forEach((bundle, bi) => {
    let prevEndPos = 0;
    bundle.forEach((p, pi) => {
      let extractStartPos = p[0] - extensionLength;
      let startPrefix = "";
      let extractEndPos = p[0] + p[1] + extensionLength;
      let endPrefix = "";
      if (content) {
        if (pi === 0 && bi === 0) {
          // First item only.
          if (extractStartPos < 0) {
            extractStartPos = 0;
            startPrefix = "";
          } else {
            startPrefix = "...";
          }
        }
        if (pi === bundle.length - 1) {
          // Last item or only item.
          if (extractEndPos > content.length - 1) {
            extractEndPos = content.length - 1;
            endPrefix = "";
          } else {
            endPrefix = "...";
          }
        }

        extractStartPos = prevEndPos ? prevEndPos : extractStartPos;

        if (pi !== bundle.length - 1) {
          // If there are additional extract parts to add.
          extractEndPos = p[0] + p[1];
          prevEndPos = extractEndPos;
        }

        const preExtract = content.substring(extractStartPos, p[0]);
        const match = content.substring(p[0], p[0] + p[1]);
        const postExtract = content.substring(p[0] + p[1], extractEndPos);

        contentExtractArray.push({
          extract: startPrefix + preExtract,
          type: "text",
        });
        contentExtractArray.push({ extract: match, type: "match" });
        contentExtractArray.push({
          extract: postExtract + endPrefix,
          type: "text",
        });
      }
    });
  });
  return contentExtractArray;
};

const getExtracts = (
  matchMetadata: Metadata,
  content: SearchableContent
): Extracts => {
  const allContentPositions: Position[] = [];
  const allTitlePositions: Position[] = [];

  for (const field of Object.values(matchMetadata)) {
    if (field.title) {
      field.title.position.forEach((p) => {
        allTitlePositions.push(p);
      });
    }
    if (field.content) {
      field.content.position.forEach((p) => {
        allContentPositions.push(p);
      });
    }
  }

  return {
    formattedTitle: getTitleExtractArray(allTitlePositions, content.title),
    // Content needs a fallback if only text in the title is matched.
    formattedContent: getContentExtractArray(
      allContentPositions,
      content.content || ""
    ),
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
  content: string | undefined;
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
