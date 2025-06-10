/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createMessageConnection } from "vscode-jsonrpc";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from "vscode-jsonrpc/browser";
import { baseUrl } from "../base";
import { createUri, LanguageServerClient } from "./client";
import { CreateToastFnReturn } from "@chakra-ui/react";

// This is modified by bin/update-pyright.sh
const workerScriptName = "pyright-main-d88c47e1d8506418b899.worker.js";

// Very simple cache to avoid React re-creating pointlessly in development.
let counter = 0;
let cache:
  | {
      client: LanguageServerClient;
      language: string;
    }
  | undefined;

/**
 * Creates Pyright workers and corresponding client.
 *
 * These are recreated when the language changes.
 */
export const pyright = async (
  language: string,
  toast: CreateToastFnReturn
): Promise<LanguageServerClient | undefined> => {
  // For jsdom.
  if (!window.Worker) {
    return undefined;
  }
  if (cache) {
    // This is safe to call if already initialized.
    await cache.client.initialize();
    if (cache.language === language) {
      return cache.client;
    } else {
      // Dispose it, we'll create a new one.
      cache?.client.dispose();
      cache = undefined;
    }
  }

  const idSuffix = counter++;
  // Needed to support review branches that use a path location.
  const workerScript = `${baseUrl}workers/${workerScriptName}`;
  const foreground = new Worker(workerScript, {
    name: `Pyright-foreground-${idSuffix}`,
  });
  foreground.postMessage({
    type: "browser/boot",
    mode: "foreground",
  });
  const connection = createMessageConnection(
    new BrowserMessageReader(foreground),
    new BrowserMessageWriter(foreground)
  );
  const workers: Worker[] = [foreground];
  connection.onDispose(() => {
    workers.forEach((w) => w.terminate());
  });

  let backgroundWorkerCount = 0;
  foreground.addEventListener("message", (e: MessageEvent) => {
    if (e.data && e.data.type === "browser/newWorker") {
      // Create a new background worker.
      // The foreground worker has created a message channel and passed us
      // a port. We create the background worker and pass transfer the port
      // onward.
      const { initialData, port } = e.data;
      const background = new Worker(workerScript, {
        name: `Pyright-background-${idSuffix}-${++backgroundWorkerCount}`,
      });
      workers.push(background);
      background.postMessage(
        {
          type: "browser/boot",
          mode: "background",
          initialData,
          port,
        },
        [port]
      );
    }
  });
  connection.listen();

  const client = new LanguageServerClient(
    connection,
    language,
    createUri(""),
    toast
  );
  // Must assign before any async step so we reuse or dispose this client
  // if another call to pyright is made (language change or React 18 dev mode
  // in practice).
  cache = {
    client,
    language,
  };
  await client.initialize();
  return cache?.client;
};
