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
  useRef,
  useState,
} from "react";
import useIsUnmounted from "../../common/use-is-unmounted";
import { useLogging } from "../../logging/logging-hooks";
import { useSettings } from "../../settings/settings";
import { useDocumentation } from "../documentation-hooks";
import { SearchResults } from "./common";
import { WorkerSearch } from "./search-client";

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
  const [{ languageId }] = useSettings();
  const search = useRef<WorkerSearch>();

  useEffect(() => {
    if (languageId !== search.current?.language) {
      search.current?.dispose();
      search.current = new WorkerSearch(languageId);
      setQuery("");
    }
    // Wait for everything to be loaded and in the right language
    if (
      reference.status === "ok" &&
      reference.languageId === languageId &&
      api?.languageId === languageId
    ) {
      search.current.index(reference.content, api.content);
    }
  }, [languageId, reference, api]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (newQuery: string) => {
        if (!search.current) {
          return;
        }
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery) {
          const results = await search.current.search(trimmedQuery);
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
    debouncedSearch(query);
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
