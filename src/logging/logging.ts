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
  error(e: any): void;
  log(e: any): void;
}
