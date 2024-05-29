/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Event, Logging } from "../../logging/logging";

export class NullLogging implements Logging {
  event(_event: Event): void {}
  error(_e: any): void {}
  log(_e: any): void {}
}
