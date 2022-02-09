/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { DebouncedFunc } from "lodash";
import debounce from "lodash.debounce";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useIsUnmounted from "../../common/use-is-unmounted";
import { useLogging } from "../../logging/logging-hooks";
import { useSettings } from "../../settings/settings";
import { useToolkitState } from "../toolkit-hooks";
import { Search, SearchResults } from "./common";
import { WorkerSearch } from "./search-client";

const search: Search = new WorkerSearch();

type UseSearch = [
  SearchResults | undefined,
  DebouncedFunc<(newQuery: string) => Promise<void>>
];

const SearchContext = createContext<UseSearch | undefined>(undefined);

export const useSearch = (): UseSearch => {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { exploreToolkit, referenceToolkit } = useToolkitState();
  const [query] = useSearchQuery();
  const [results, setResults] = useState<SearchResults | undefined>();
  const isUnmounted = useIsUnmounted();
  const logging = useLogging();
  useEffect(() => {
    // Wait for both, no reason to index with just one then redo with both.
    if (exploreToolkit.status === "ok" && referenceToolkit) {
      search.index(exploreToolkit.toolkit, referenceToolkit);
    }
  }, [exploreToolkit, referenceToolkit]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (newQuery: string) => {
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery) {
          const results = await search.search(trimmedQuery);
          if (!isUnmounted()) {
            setResults((prevResults) => {
              if (!prevResults) {
                logging.event({ type: "search" });
              }
              return results;
            });
          }
        } else {
          setResults(undefined);
        }
      }, 300),
    [setResults, isUnmounted, logging]
  );

  useEffect(() => {
    const getSearchResults = async () => {
      await debouncedSearch(query);
    };

    getSearchResults();
  }, [debouncedSearch, query]);

  const value: UseSearch = [results, debouncedSearch];
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

type SearchQuery = [string, React.Dispatch<React.SetStateAction<string>>];

const SearchQueryContext = createContext<SearchQuery | undefined>(undefined);

export const useSearchQuery = (): SearchQuery => {
  const value = useContext(SearchQueryContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const SearchQueryProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState<string>("");
  const [{ languageId }] = useSettings();

  useEffect(() => {
    setQuery("");
  }, [languageId]);

  const value: SearchQuery = [query, setQuery];
  return (
    <SearchQueryContext.Provider value={value}>
      <SearchProvider>{children}</SearchProvider>
    </SearchQueryContext.Provider>
  );
};

export default SearchQueryProvider;
