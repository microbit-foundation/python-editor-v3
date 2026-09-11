/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "../../logging/logging";

/**
 * Console-only logging for tests and the NullLoggingProvider. The app
 * itself always uses Logger (see src/deployment/index.ts), which also
 * falls back to the console when no analytics or Sentry are configured.
 */
export class ConsoleLogging implements Logging {
  event(event: Event): void {
    console.log(event);
  }
  error(
    message: string,
    e: unknown,
    context?: Record<string, unknown>
  ): string | undefined {
    if (context) {
      console.error(message, e, context);
    } else {
      console.error(message, e);
    }
    return undefined;
  }
  log(e: any): void {
    console.log(e);
  }
  setUserProperty(name: string, value: string): void {
    console.log("[ConsoleLogging] setUserProperty:", name, value);
  }
}
