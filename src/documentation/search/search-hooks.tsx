/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useEffect } from "react";
import { flags } from "../../flags";
import { ApiDocsResponse } from "../../language-server/apidocs";
import { Toolkit } from "../explore/model";
import { useToolkitState } from "../toolkit-hooks";
import { Search, SearchResults } from "./common";
import { WorkerSearch } from "./search-client";

export class NullSearch implements Search {
  search(text: string): Promise<SearchResults> {
    return Promise.resolve({
      explore: [],
      reference: [],
    });
  }
  index(explore: Toolkit, reference: ApiDocsResponse): void {}
}

const search: Search = flags.search ? new WorkerSearch() : new NullSearch();

const SearchContext = createContext<Search | undefined>(undefined);

export const useSearch = (): Search => {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { exploreToolkit, referenceToolkit } = useToolkitState();
  useEffect(() => {
    // Wait for both, no reason to index with just one then redo with both.
    if (exploreToolkit.status === "ok" && referenceToolkit) {
      search.index(exploreToolkit.toolkit, referenceToolkit);
    }
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
