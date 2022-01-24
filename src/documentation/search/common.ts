import type { ApiDocsResponse } from "../../language-server/apidocs";
import type { RouterState } from "../../router-hooks";
import { Toolkit } from "../explore/model";

export interface Search {
  search(text: string): Promise<SearchResults>;
}

export interface SearchResults {
  explore: Result[];
  reference: Result[];
}

export interface Result {
  id: string;
  navigation: RouterState;
  containerTitle: string;
  title: string;
  extract: Extracts;
}

export interface Extract {
  extract: string;
  type: "text" | "match";
}

export interface Extracts {
  title: Extract[];
  content: Extract[];
}

export interface IndexMessage {
  kind: "index";
  explore: Toolkit;
  reference: ApiDocsResponse;
}

export interface QueryMessage {
  kind: "query";
  query: string;
}

export interface QueryResponseMessage extends SearchResults {
  kind: "queryResponse";
}

export type Message = IndexMessage | QueryMessage | QueryResponseMessage;
