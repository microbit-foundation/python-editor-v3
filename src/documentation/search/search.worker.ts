/* eslint-disable */

import { IndexMessage, QueryMessage, QueryResponseMessage } from "./common";
import { buildToolkitIndex, LunrSearch } from "./search";

const ctx: Worker = self as any;

let search: LunrSearch | undefined;

const index = (message: IndexMessage) => {
  search = buildToolkitIndex(message.explore, message.reference);
};

const query = (message: QueryMessage): QueryResponseMessage => {
  if (!search) {
    throw new Error("Query before index");
  }
  console.log(search.search(message.query));
  return {
    kind: "queryResponse",
    ...search.search(message.query),
  };
};

ctx.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  switch (data.kind) {
    case "query": {
      ctx.postMessage(query(data as QueryMessage));
      return;
    }
    case "index": {
      index(data as IndexMessage);
      return;
    }
    default:
      console.error("Unexpected worker message: ");
  }
};
