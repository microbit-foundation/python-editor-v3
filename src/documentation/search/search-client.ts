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

import { ApiDocsResponse } from "../../language-server/apidocs";
import { Toolkit } from "../reference/model";

export class WorkerSearch implements Search {
  private worker: Worker;
  private resolveQueue: Array<(value: SearchResults) => void> = [];
  constructor(public language: string) {
    this.worker = workerForLanguage(language);
  }
  index(reference: Toolkit, api: ApiDocsResponse) {
    const message: IndexMessage = {
      kind: "index",
      reference,
      api,
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

  dispose() {
    // We just ask nicely so it can respond to any in flight requests
    this.worker.postMessage({
      kind: "shutdown",
    });
  }
}

const workerForLanguage = (language: string) => {
  // See also convertLangToLunrParam

  // Enumerated for code splitting as Vite doesn't support dynamic strings here
  // We use a worker per language because Vite doesn't support using dynamic
  // import in a iife Worker and Safari doesn't support module workers.
  switch (language.toLowerCase()) {
    case "de": {
      return new Worker(new URL(`./search.worker.de.ts`, import.meta.url), {
        type: "module",
      });
    }
    case "fr": {
      return new Worker(new URL(`./search.worker.fr.ts`, import.meta.url), {
        type: "module",
      });
    }
    case "es-es": {
      return new Worker(new URL(`./search.worker.es.ts`, import.meta.url), {
        type: "module",
      });
    }
    case "ja": {
      return new Worker(new URL(`./search.worker.ja.ts`, import.meta.url), {
        type: "module",
      });
    }
    case "ko": {
      return new Worker(new URL(`./search.worker.ko.ts`, import.meta.url), {
        type: "module",
      });
    }
    case "nl": {
      return new Worker(new URL(`./search.worker.nl.ts`, import.meta.url), {
        type: "module",
      });
    }
    default:
      return new Worker(new URL(`./search.worker.en.ts`, import.meta.url), {
        type: "module",
      });
  }
};
