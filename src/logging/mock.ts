/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "./logging";

export class MockLogging implements Logging {
  events: Event[] = [];
  errors: Array<{
    message: string;
    e: unknown;
    context?: Record<string, unknown>;
  }> = [];
  logs: any[] = [];
  userProperties: Record<string, string> = {};
  /** What error() returns, for tests of code that shows the reference. */
  errorReference: string | undefined = undefined;

  event(event: Event): void {
    this.events.push(event);
  }
  error(
    message: string,
    e: unknown,
    context?: Record<string, unknown>
  ): string | undefined {
    this.errors.push({ message, e, context });
    return this.errorReference;
  }
  log(e: any): void {
    this.logs.push(e);
  }
  setUserProperty(name: string, value: string): void {
    this.userProperties[name] = value;
  }
}
