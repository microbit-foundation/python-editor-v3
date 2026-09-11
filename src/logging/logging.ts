/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export interface Event {
  type: string;
  message?: string;
  value?: number;
  detail?: any;
}

export interface Logging {
  event(event: Event): void;
  /**
   * Report an error. `context` is attached to the Sentry event as extra
   * data; keep it to primitives and never include document text.
   *
   * Returns a reference for the report (the Sentry event id) when one was
   * sent, for showing to the user so support can find the report.
   */
  error(
    message: string,
    e: unknown,
    context?: Record<string, unknown>
  ): string | undefined;
  log(e: any): void;
  /**
   * Set a GA4 user property — auto-attaches to every subsequent event
   * for the same user. Set early (e.g. on app boot) so events fired
   * after are queryable by it.
   */
  setUserProperty(name: string, value: string): void;
}
