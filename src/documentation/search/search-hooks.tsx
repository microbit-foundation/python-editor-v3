/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useEffect } from "react";
import { flags } from "../../flags";
import { useToolkitState } from "../toolkit-hooks";
import { Search } from "./common";
import { WorkerSearch } from "./search-client";

const search: WorkerSearch | undefined = flags.search
  ? new WorkerSearch()
  : undefined;

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
    // Wait for both, we'll be re-run for each at start-up.
    if (exploreToolkit.status === "ok" && referenceToolkit) {
      search?.index(exploreToolkit.toolkit, referenceToolkit);
    }
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
