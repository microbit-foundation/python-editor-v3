/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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
import { useDocumentation } from "../documentation-hooks";
import { Search, SearchResults } from "./common";
import { WorkerSearch } from "./search-client";

const search: Search = new WorkerSearch();

type UseSearch = {
  results: SearchResults | undefined;
  query: string;
  setQuery: (newQuery: string) => void;
};

const SearchContext = createContext<UseSearch | undefined>(undefined);

export const useSearch = (): UseSearch => {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { reference, api } = useDocumentation();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResults | undefined>();
  const isUnmounted = useIsUnmounted();
  const logging = useLogging();
  useEffect(() => {
    // Wait for both, no reason to index with just one then redo with both.
    if (reference.status === "ok" && api) {
      search.index(reference.content, api);
    }
  }, [reference, api]);

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

  const [{ languageId }] = useSettings();
  useEffect(() => {
    setQuery("");
  }, [languageId]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(undefined);
    } else {
      debouncedSearch(query);
    }
  }, [debouncedSearch, query]);

  const value: UseSearch = useMemo(
    () => ({ results, query, setQuery }),
    [results, query, setQuery]
  );
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
