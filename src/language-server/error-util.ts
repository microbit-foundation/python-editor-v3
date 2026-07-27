import { ToastFn } from "@microbit/ui";
import { ConnectionError, ErrorCodes, ResponseError } from "vscode-jsonrpc";

// The language server gets disposed/recreated which can cause errors for
// initialization or in-flight requests. We ignore these when they occur.
export const isErrorDueToDispose = (e: unknown): boolean =>
  (e instanceof ResponseError &&
    e.code === ErrorCodes.PendingResponseRejected) ||
  e instanceof ConnectionError;

export class OfflineError extends Error {}

export const offlineToastTextIds = {
  titleId: "offline-language-toast-title",
  descriptionId: "offline-language-toast-description",
};

export const showOfflineLanguageToast = (toast: ToastFn): void => {
  toast({
    // Adding a toast whose id is already visible is a no-op.
    id: "offline-language-toast",
    // We can't use intl inside the TranslationProvider component.
    // Fallback to hardcoded English.
    title: "Language unavailable offline",
    description:
      "The language will update when you next open the micro:bit Python Editor and you are online.",
    status: "info",
    duration: 5_000,
    isClosable: true,
  });
};
