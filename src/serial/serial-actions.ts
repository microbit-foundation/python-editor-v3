/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { MicrobitWebUSBConnection } from "@microbit/microbit-connection";
import { Terminal } from "xterm";
import { Logging } from "../logging/logging";

/**
 * Serial/terminal/REPL UI-level actions.
 */
export class SerialActions {
  constructor(
    private terminal: React.RefObject<Terminal | undefined>,
    private device: MicrobitWebUSBConnection,
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
