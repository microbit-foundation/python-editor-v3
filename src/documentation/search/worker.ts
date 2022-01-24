/* eslint-disable */

import { SearchIndex } from "./search-hooks";

const ctx: Worker = self;

const index = () => {
  new SearchIndex();
};

self.onmessage = (event: MessageEvent) => {
  const data = event.data;
  switch (data.kind) {
    case "query":
      search(asQueryMessage(data));
    case "index":
      index(asIndexMessage(data));
    default:
      console.error("Unexpected worker message: ");
  }
};
