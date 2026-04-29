/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "../../logging/logging";

export class ConsoleLogging implements Logging {
  event(event: Event): void {
    console.log(event);
  }
  error(e: any): void {
    console.error(e);
  }
  log(e: any): void {
    console.log(e);
  }
}
