/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Terminal } from "xterm";
import { DeviceConnection } from "@microbit/microbit-connection";
import { Logging } from "../logging/logging";

/**
 * Serial/terminal/REPL UI-level actions.
 */
export class SerialActions {
  constructor(
    private terminal: React.RefObject<Terminal | undefined>,
    private device: DeviceConnection,
    private onSerialSizeChange: (size: "compact" | "open") => void,
    private logging: Logging
  ) {}

  interrupt = (): void => {
    this.logging.event({ type: "serial-interrupt" });
    this.sendCommand("\x03");
  };
  reset = (): void => {
    this.logging.event({ type: "serial-reset" });
    this.sendCommand("\x04");
  };

  private sendCommand(data: string): void {
    this.onSerialSizeChange("open");
    this.device.serialWrite(data);
    this.terminal.current?.focus();
  }
}
