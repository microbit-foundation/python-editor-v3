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
import { createUri, LanguageServerClient } from "./client";

/**
 * Creates Pyright workers and corresponding client.
 *
 * These have the same lifetime as the app.
 */
export const pyright = (): LanguageServerClient | undefined => {
  // For jest.
  if (!window.Worker) {
    return undefined;
  }
  // Needed to support review branches that use a path location.
  const { origin, pathname } = window.location;
  const base = `${origin}${pathname}${pathname.endsWith("/") ? "" : "/"}`;
  const workerScript = `${base}workers/pyright-8587f403755caf97977f.worker.js`;
  const channel = new MessageChannel();
  const foreground = new Worker(workerScript);
  foreground.postMessage(
    {
      type: "boot",
      mode: "foreground",
      port: channel.port1,
    },
    [channel.port1]
  );
  const background = new Worker(workerScript);
  background.postMessage(
    {
      type: "boot",
      mode: "background",
      port: channel.port2,
    },
    [channel.port2]
  );
  const connection = createMessageConnection(
    new BrowserMessageReader(foreground),
    new BrowserMessageWriter(foreground)
  );
  connection.listen();

  // Must bootstrap before the initialize request so that the config file is in place.
  // Need a better way to do this. Messages before init aren't valid LSP.
  const client = new LanguageServerClient(connection, {
    rootUri: createUri(""),
    initializationOptions: async () => {
      const typeshed = await import("./typeshed.json");
      return {
        files: typeshed,
      };
    },
  });
  return client;
};
