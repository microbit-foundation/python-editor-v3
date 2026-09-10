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
 *
 * Non-Error values are converted before capture. Sentry otherwise titles
 * them "Object captured as exception with keys: ..." and groups them all
 * together, which is what happens to errors structured-cloned across
 * postMessage from the simulator (e.g. Emscripten's ExitStatus, which
 * does not extend Error).
 */
export const reportError = (
  dsn: string | undefined,
  message: string,
  e: unknown,
  context?: Record<string, unknown>
): void => {
  if (context) {
    console.error(message, e, context);
  } else {
    console.error(message, e);
  }
  if (!dsn) {
    return;
  }
  try {
    sentryAddBreadcrumb({
      message,
      type: "error-message",
      level: "error",
    });
    const { error, extra } = toError(e);
    const combined = extra || context ? { ...extra, ...context } : undefined;
    sentryCaptureException(error, combined ? { extra: combined } : undefined);
  } catch (err) {
    console.error(err);
  }
};

interface NormalisedError {
  error: Error;
  extra?: Record<string, unknown>;
}

const toError = (e: unknown): NormalisedError => {
  if (e instanceof Error) {
    return { error: e };
  }
  let error: Error;
  let extra: Record<string, unknown> | undefined;
  if (typeof e === "object" && e !== null) {
    const { name, message, ...rest } = e as Record<string, unknown>;
    error = new Error(typeof message === "string" ? message : stringify(e));
    if (typeof name === "string" && name) {
      error.name = name;
    }
    extra = Object.keys(rest).length > 0 ? rest : undefined;
  } else {
    error = new Error(String(e));
  }
  // The stack we'd get here is just the logging call chain, identical for
  // every caller, so Sentry would group unrelated errors together. Without
  // one it falls back to grouping by type and message.
  error.stack = undefined;
  return { error, extra };
};

const stringify = (e: object): string => {
  try {
    return JSON.stringify(e);
  } catch {
    return Object.prototype.toString.call(e);
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
