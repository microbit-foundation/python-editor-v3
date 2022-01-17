/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useToolkitState } from "./ToolkitProvider";
import lunr from "lunr";

interface Search {
  search(text: string): string[];
}

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

  const value: Search = useMemo(() => {
    // Use toolkits here to create index rather than hardcoded example.
    const documents = [
      {
        id: "Lunr",
        text: "Like Solr, but much smaller, and not as bright.",
      },
      {
        id: "React",
        text: "A JavaScript library for building user interfaces.",
      },
      {
        id: "Lodash",
        text: "A modern JavaScript utility library delivering modularity, performance & extras and very modern.",
      },
    ];

    const index = lunr(function () {
      this.ref("id");
      this.field("text");
      this.metadataWhitelist = ["position"];
      for (const doc of documents) {
        this.add(doc);
      }
    });

    return {
      search: (text: string) => {
        const results = index.search(text);
        console.log(results);
        return results.map((r) => r.ref);
      },
    };
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
