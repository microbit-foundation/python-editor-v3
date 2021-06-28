/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "./logging";

export class MockLogging implements Logging {
  events: Event[] = [];
  errors: any[] = [];
  logs: any[] = [];

  event(event: Event): void {
    this.events.push(event);
  }
  error(e: any): void {
    this.errors.push(e);
  }
  log(e: any): void {
    this.logs.push(e);
  }
}
