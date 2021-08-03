/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { languageServer } from "./client";
import { WorkerTransport } from "./transport";

export const pyright = () => {
  // For jest.
  if (window.Worker) {
    // Needed to support review branches that use a path location.
    const { origin, pathname } = window.location;
    const base = `${origin}${pathname}${pathname.endsWith("/") ? "" : "/"}`;
    const workerScript = `${base}workers/pyright-052dd71b1e146be725c3.worker.js`;
    const worker = new Worker(workerScript);
    const transport = new WorkerTransport(worker);
    return languageServer(
      {
        rootUri: "/src/",
        documentUri: "/src/main.py",
        languageId: "python",
      },
      transport
    );
  }
  return [];
};
