/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  addBreadcrumb as sentryAddBreadcrumb,
  captureException as sentryCaptureException,
  init as sentryInit,
} from "@sentry/browser";

/**
 * Initialise Sentry from build-time env. Returns the configured DSN if
 * Sentry was set up, or undefined if disabled — callers use that to
 * short-circuit reporting paths.
 */
export const initSentry = (env: Record<string, string>): string | undefined => {
  const version = env.VITE_VERSION || "unknown";
  const stage = env.VITE_STAGE || "unknown";
  // Disable Sentry for the REVIEW stage even if the env var is set.
  const dsn = stage === "REVIEW" ? undefined : env.VITE_SENTRY_DSN;
  if (!dsn) {
    return undefined;
  }
  try {
    sentryInit({
      dsn,
      release: `python-editor-v${version}`,
      environment: stage,
      ignoreErrors: [
        // Low consequence and a big chunk of quota.
        "ResizeObserver loop completed with undelivered notifications",
      ],
    });
  } catch (e) {
    console.error(e);
  }
  return dsn;
};

/**
 * Report an error to Sentry (if configured) and the console.
 */
export const reportError = (
  dsn: string | undefined,
  message: string,
  e: unknown
): void => {
  console.error(message, e);
  if (!dsn) {
    return;
  }
  try {
    sentryAddBreadcrumb({
      message,
      type: "error-message",
      level: "error",
    });
    sentryCaptureException(e);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Add a breadcrumb to Sentry, or console-log it as a fallback when
 * Sentry isn't configured. Used to record analytics events as context
 * so they appear in the timeline of any captured exception.
 */
export const reportBreadcrumb = (
  dsn: string | undefined,
  category: string,
  data: object | string
): void => {
  if (dsn) {
    sentryAddBreadcrumb({
      category,
      message: typeof data === "string" ? data : undefined,
      data: typeof data === "object" ? data : undefined,
      level: "info",
    });
  } else {
    // Avoid double-logging via console + Sentry breadcrumbs when Sentry is on.
    console.log(category, JSON.stringify(data));
  }
};
