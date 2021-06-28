/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "../../logging/logging";

export class NullLogging implements Logging {
  event(event: Event): void {}
  error(e: any): void {}
  log(e: any): void {}
}
