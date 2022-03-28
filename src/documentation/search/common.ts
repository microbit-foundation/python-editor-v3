/**
 * Shared between the search worker and client code.
 *
 * We only need type definitions of the content.
 *
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT */
import type { ApiDocsResponse } from "../../language-server/apidocs";
import type { RouterState } from "../../router-hooks";
import type { Toolkit } from "../reference/model";

export interface Search {
  search(text: string): Promise<SearchResults>;
  index(reference: Toolkit, api: ApiDocsResponse): void;
}

export interface SearchResults {
  reference: Result[];
  api: Result[];
}

export interface Result {
  id: string;
  navigation: RouterState;
  containerTitle: string;
  title: string;
  extract: Extracts;
}

export interface Extract {
  type: "text" | "match";
  extract: string;
}

export interface Extracts {
  title: Extract[];
  content: Extract[];
}

export interface IndexMessage {
  kind: "index";
  reference: Toolkit;
  api: ApiDocsResponse;
}

export interface QueryMessage {
  kind: "query";
  query: string;
}

export interface QueryResponseMessage extends SearchResults {
  kind: "queryResponse";
}

export type Message = IndexMessage | QueryMessage | QueryResponseMessage;
