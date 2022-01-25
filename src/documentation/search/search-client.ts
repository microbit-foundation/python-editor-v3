/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IndexMessage,
  QueryMessage,
  QueryResponseMessage,
  Search,
  SearchResults,
} from "./common";

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./search.worker";
import { ApiDocsResponse } from "../../language-server/apidocs";
import { Toolkit } from "../explore/model";

export class WorkerSearch implements Search {
  private worker: Worker;
  private resolveQueue: Array<(value: SearchResults) => void> = [];
  constructor() {
    this.worker = new Worker();
  }
  index(explore: Toolkit, reference: ApiDocsResponse) {
    const message: IndexMessage = {
      kind: "index",
      explore,
      reference,
    };
    this.worker.postMessage(message);
    this.worker.onmessage = (e) => {
      const resolve = this.resolveQueue.shift();
      if (!resolve) {
        throw new Error("Missing queue entry");
      }
      const message = e.data as QueryResponseMessage;
      resolve(message);
    };
  }
  search(text: string): Promise<SearchResults> {
    const message: QueryMessage = {
      kind: "query",
      query: text,
    };
    const promise = new Promise<SearchResults>((resolve) => {
      this.resolveQueue.push(resolve);
      this.worker.postMessage(message);
    });
    return promise;
  }
}
