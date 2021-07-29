/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useContext, useEffect, useState } from "react";
import {
  MicrobitWebUSBConnection,
  EVENT_STATUS,
  ConnectionStatus,
  EVENT_SERIAL_DATA,
  EVENT_SERIAL_RESET,
  EVENT_SERIAL_ERROR,
} from "./device";

export const DeviceContext = React.createContext<
  undefined | MicrobitWebUSBConnection
>(undefined);

/**
 * Hook to access the device from UI code.
 *
 * @returns The device.
 */
export const useDevice = () => {
  const device = useContext(DeviceContext);
  if (!device) {
    throw new Error("Missing provider.");
  }
  return device;
};

/**
 * State that tracks the device connections status.
 */
export const useConnectionStatus = () => {
  const device = useDevice();
  const [status, setStatus] = useState<ConnectionStatus>(device.status);
  useEffect(() => {
    const statusListener = (status: ConnectionStatus) => {
      setStatus(status);
    };
    device.on(EVENT_STATUS, statusListener);
    return () => {
      device.removeListener(EVENT_STATUS, statusListener);
    };
  }, [device, setStatus]);

  return status;
};

export interface Traceback {
  error: string;
  trace: string[];
}

export class TracebackScrollback {
  private scrollback: string = "";
  push(data: string) {
    this.scrollback = this.scrollback + data;
    const limit = 4096;
    if (this.scrollback.length > limit) {
      this.scrollback = this.scrollback.slice(data.length - limit);
    }
    const lines = this.scrollback.split("\r\n");
    for (let i = lines.length - 1; i >= 0; --i) {
      if (lines[i].startsWith("Traceback (most recent call last):")) {
        // Start of last traceback
        // Skip all following lines with an indent and grab the first one without, which is the error message.
        let endOfIndent = i + 1;
        while (
          endOfIndent < lines.length &&
          lines[endOfIndent].startsWith("  ")
        ) {
          endOfIndent++;
        }
        if (endOfIndent < lines.length) {
          const trace = lines
            .slice(i + 1, endOfIndent)
            .map((line) => line.trim());
          if (trace[0] && trace[0].startsWith('File "<stdin>"')) {
            // User entered code at the REPL, discard.
            return undefined;
          }
          const error = lines[endOfIndent];
          if (error.startsWith("KeyboardInterrupt")) {
            // User interrupted the program (we assume), discard.
            return undefined;
          }
          return { error, trace };
        }
        return undefined;
      }
    }
    return undefined;
  }
  clear() {
    this.scrollback = "";
  }
}

export const useDeviceTraceback = () => {
  const device = useDevice();
  const [runtimeError, setRuntimeError] = useState<Traceback | undefined>(
    undefined
  );

  useEffect(() => {
    const buffer = new TracebackScrollback();
    const dataListener = (data: string) => {
      setRuntimeError(buffer.push(data));
    };
    const clearListener = () => {
      buffer.clear();
      setRuntimeError(undefined);
    };
    device.addListener(EVENT_SERIAL_DATA, dataListener);
    device.addListener(EVENT_SERIAL_RESET, clearListener);
    device.addListener(EVENT_SERIAL_ERROR, clearListener);
    return () => {
      device.removeListener(EVENT_SERIAL_ERROR, clearListener);
      device.removeListener(EVENT_SERIAL_RESET, clearListener);
      device.removeListener(EVENT_SERIAL_DATA, dataListener);
    };
  }, [device, setRuntimeError]);

  return runtimeError;
};
