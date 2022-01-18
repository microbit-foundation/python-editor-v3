/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useToolkitState } from "./toolkit-hooks";
import lunr from "lunr";
import { ApiDocsResponse, ApiDocsEntry } from "../language-server/apidocs";
import { State } from "./documentation-hooks";
import { blocksToText } from "../common/sanity-utils";

interface SearchResults {
  exploreResults: lunr.Index.Result[];
  referenceResults: lunr.Index.Result[];
}

export class Search {
  private exploreSearchIndex: lunr.Index;
  private referenceSearchIndex: lunr.Index;

  constructor(
    exploreSearchIndex: lunr.Index,
    referenceSearchIndex: lunr.Index
  ) {
    this.exploreSearchIndex = exploreSearchIndex;
    this.referenceSearchIndex = referenceSearchIndex;
  }

  search(text: string): SearchResults {
    const exploreResults = this.exploreSearchIndex.search(text);
    const referenceResults = this.referenceSearchIndex.search(text);
    return {
      exploreResults,
      referenceResults,
    };
  }
}

export interface SearchableContent {
  id: string;
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

const getExploreSearchableContent = (
  exploreToolkit: State
): SearchableContent[] => {
  const searchableExploreContent: SearchableContent[] = [];
  if (exploreToolkit.status === "ok") {
    exploreToolkit.toolkit.contents?.forEach((t) => {
      t.contents?.forEach((e) => {
        const contentString = blocksToText(e.content);
        const detailContentString = blocksToText(e.detailContent);
        searchableExploreContent.push({
          id: e.slug.current,
          title: e.name,
          content: contentString + detailContentString,
        });
      });
    });
  }
  return searchableExploreContent;
};

const getReferenceSearchableContent = (
  referenceToolkit: ApiDocsResponse | undefined
): SearchableContent[] => {
  const searchableReferenceContent: SearchableContent[] = [];
  const getNestedDocs = (entries: ApiDocsEntry[] | undefined): void => {
    if (entries) {
      entries.forEach((c) => {
        searchableReferenceContent.push({
          id: c.id,
          title: c.fullName,
          content: validateString(c.docString),
        });
        getNestedDocs(c.children);
      });
    }
  };
  if (referenceToolkit) {
    for (const doc in referenceToolkit) {
      getNestedDocs(referenceToolkit[doc].children);
    }
  }
  return searchableReferenceContent;
};

const buildSearchIndex = (
  searchableContent: SearchableContent[]
): lunr.Index => {
  return lunr(function () {
    this.ref("id");
    this.field("title");
    this.field("content");
    this.metadataWhitelist = ["position"];
    for (const doc of searchableContent) {
      this.add(doc);
    }
  });
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { exploreToolkit, referenceToolkit } = useToolkitState();

  const value: Search = useMemo(() => {
    const exploreSearchIndex: lunr.Index = buildSearchIndex(
      getExploreSearchableContent(exploreToolkit)
    );
    const referenceSearchIndex: lunr.Index = buildSearchIndex(
      getReferenceSearchableContent(referenceToolkit)
    );

    return new Search(exploreSearchIndex, referenceSearchIndex);
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
