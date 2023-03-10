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

// This is modified by bin/update-pyright.sh
const workerScriptName = "pyright-main-9de05813f9fe07eabc93.worker.js";

// Very simple cache to avoid React re-creating pointlessly in development.
let counter = 0;
let cached: LanguageServerClient | undefined;
let cachedLang: string | undefined;

/**
 * Creates Pyright workers and corresponding client.
 *
 * These are recreated when the language changes.
 */
export const pyright = async (
  language: string
): Promise<LanguageServerClient | undefined> => {
  // For jest.
  if (!window.Worker) {
    return undefined;
  }
  if (cached && cachedLang === language) {
    return cached;
  }
  // Dispose it, we'll create a new one.
  cached?.dispose();

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

  cached = new LanguageServerClient(connection, language, createUri(""));
  await cached.initialize();
  cachedLang = language;
  return cached;
};
