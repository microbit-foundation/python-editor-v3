import { ConnectionError, ErrorCodes, ResponseError } from "vscode-jsonrpc";

// The language server gets disposed/recreated which can cause errors for
// initialization or in-flight requests. We ignore these when they occur.
export const isErrorDueToDispose = (e: unknown): boolean =>
  (e instanceof ResponseError &&
    e.code === ErrorCodes.PendingResponseRejected) ||
  e instanceof ConnectionError;

export class OfflineError extends Error {}
