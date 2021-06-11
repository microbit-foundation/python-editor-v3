import { Event, Logging } from "../../logging/logging";

export class NullLogging implements Logging {
  event(event: Event): void {}
  error(e: any): void {}
  log(e: any): void {}
}
