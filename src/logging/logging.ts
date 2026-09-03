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
  error(message: string, e: unknown): void;
  log(e: any): void;
  /**
   * Set a GA4 user property — auto-attaches to every subsequent event
   * for the same user. Set early (e.g. on app boot) so events fired
   * after are queryable by it.
   */
  setUserProperty(name: string, value: string): void;
}
