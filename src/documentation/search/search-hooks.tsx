/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import lunr from "lunr";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { blocksToText } from "../../common/sanity-utils";
import { flags } from "../../flags";
import { ApiDocsEntry, ApiDocsResponse } from "../../language-server/apidocs";
import { RouterState } from "../../router-hooks";
import { ExploreToolkitState } from "./../documentation-hooks";
import {
  contextExtracts,
  Extract,
  fullStringExtracts,
  Position,
} from "./extracts";
import { useToolkitState } from "../toolkit-hooks";

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

export interface Search {
  search(text: string): SearchResults;
}

class NullSearch implements Search {
  search(text: string) {
    return {
      explore: [],
      reference: [],
    };
  }
}

class LunrSearch implements Search {
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

const exploreSearchableContent = (
  state: ExploreToolkitState
): SearchableContent[] => {
  const content: SearchableContent[] = [];
  if (state.status === "ok") {
    state.toolkit.contents?.forEach((t) => {
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
  }
  return content;
};

const referenceSearchableContent = (
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
      content.push({
        id: module.id,
        title: module.fullName,
        containerTitle: module.fullName,
        content: validateString(module.docString),
      });
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
    if (!flags.search) {
      return new NullSearch();
    }

    return new LunrSearch(
      buildSearchIndex(exploreSearchableContent(exploreToolkit), "explore"),
      buildSearchIndex(
        referenceSearchableContent(referenceToolkit),
        "reference"
      )
    );
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
