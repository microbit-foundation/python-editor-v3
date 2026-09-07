/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "./logging";

export class MockLogging implements Logging {
  events: Event[] = [];
  errors: Array<{ message: string; e: unknown }> = [];
  logs: any[] = [];
  userProperties: Record<string, string> = {};

  event(event: Event): void {
    this.events.push(event);
  }
  error(message: string, e: unknown): void {
    this.errors.push({ message, e });
  }
  log(e: any): void {
    this.logs.push(e);
  }
  setUserProperty(name: string, value: string): void {
    this.userProperties[name] = value;
  }
}
