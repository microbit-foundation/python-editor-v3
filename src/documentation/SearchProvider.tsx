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

interface searchableContent {
  id: string;
  text: string | undefined;
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
  const { referenceToolkit } = useToolkitState();

  const value: Search = useMemo(() => {
    const searchableReferenceContent: searchableContent[] = [];

    if (referenceToolkit) {
      for (const doc in referenceToolkit) {
        searchableReferenceContent.push({
          id: referenceToolkit[doc].id,
          text: referenceToolkit[doc].docString,
        });
      }
    }

    const refIndex = lunr(function () {
      this.ref("id");
      this.field("text");
      this.metadataWhitelist = ["position"];
      for (const doc of searchableReferenceContent) {
        this.add(doc);
      }
    });

    return {
      search: (text: string) => {
        const results = refIndex.search(text);
        console.log(results);
        return results.map((r) => r.ref);
      },
    };
  }, [referenceToolkit]);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
