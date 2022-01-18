/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useToolkitState } from "./ToolkitProvider";
import lunr from "lunr";
import { ToolkitPortableText } from "./explore/model";

class Search {
  searchableExploreContent: SearchableContent[];
  searchableReferenceContent: SearchableContent[];
  referenceIndex: lunr.Index;
  exploreIndex: lunr.Index;

  constructor(
    searchableExploreContent: SearchableContent[],
    searchableReferenceContent: SearchableContent[]
  ) {
    this.searchableExploreContent = searchableExploreContent;
    this.searchableReferenceContent = searchableReferenceContent;
    this.exploreIndex = this.buildIndex(this.searchableExploreContent);
    this.referenceIndex = this.buildIndex(this.searchableReferenceContent);
  }
  buildIndex(searchableContent: SearchableContent[]) {
    return lunr(function () {
      this.ref("id");
      this.field("title");
      this.field("content");
      this.metadataWhitelist = ["position"];
      for (const doc of searchableContent) {
        this.add(doc);
      }
    });
  }
  search(index: lunr.Index, text: string) {
    const results = index.search(text);
    console.log(results);
    return results.map((r) => r.ref);
  }
  searchExplore(text: string) {
    return this.search(this.exploreIndex, text);
  }
  searchReference(text: string) {
    return this.search(this.referenceIndex, text);
  }
}

interface SearchableContent {
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

const defaults = { nonTextBehavior: "remove" };

const blocksToText = (
  blocks: ToolkitPortableText | undefined,
  opts = {}
): string => {
  const options = Object.assign({}, defaults, opts);
  if (!blocks) {
    return "";
  }
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return options.nonTextBehavior === "remove"
          ? ""
          : `[${block._type} block]`;
      }

      return block.children.map((child: any): string => child.text).join("");
    })
    .join("\n\n");
};

const validateString = (string: string | undefined): string => {
  return string || "";
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { exploreToolkit, referenceToolkit } = useToolkitState();

  const value: Search = useMemo(() => {
    const searchableReferenceContent: SearchableContent[] = [];
    const searchableExploreContent: SearchableContent[] = [];

    if (referenceToolkit) {
      for (const doc in referenceToolkit) {
        referenceToolkit[doc].children?.forEach((c) => {
          const classOrModuleContent = c.children
            ?.flatMap((c) => c.docString)
            .join("");
          const content =
            validateString(c.docString) + validateString(classOrModuleContent);
          searchableReferenceContent.push({
            id: c.id,
            title: c.fullName,
            content,
          });
        });
      }
    }
    console.log(searchableReferenceContent);
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

    return new Search(searchableExploreContent, searchableReferenceContent);
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
