/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { EVENT_PROJECT_UPDATED, EVENT_TEXT_EDIT } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";
import { useLogging } from "../logging/logging-hooks";
import {
  ConnectionStatus,
  DeviceConnection,
  EVENT_FLASH,
  EVENT_SERIAL_DATA,
  EVENT_SERIAL_ERROR,
  EVENT_SERIAL_RESET,
  EVENT_STATUS,
} from "./device";

const DeviceContext = React.createContext<undefined | DeviceConnection>(
  undefined
);

export const DeviceContextProvider = DeviceContext.Provider;

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

interface TraceLineParts {
  file: string | undefined;
  line: number | undefined;
}
const unknownParts: TraceLineParts = { line: undefined, file: undefined };

/**
 * Parse a line from the trace of a traceback.
 *
 * Trims leading/trailing space and returns undefined files
 * if it does not match the expected format.
 */
export const parseTraceLine = (line: string): TraceLineParts => {
  // E.g.
  // File "main.py", line 5, in foo
  // File "<stdin>", line 1, in <module>
  const match = /^File [<"]([^>"]+)[">], line (\d+)/.exec(line.trim());
  if (match) {
    const file: string | undefined =
      match[1] === "__main__" ? "main.py" : match[1];
    let line: number | undefined;
    const number = match[2];
    if (number) {
      line = parseInt(number, 10);
    }
    return { line, file };
  }
  return unknownParts;
};

export class Traceback {
  private parsed?: TraceLineParts;

  constructor(public error: string, public trace: string[]) {}

  private parse(): TraceLineParts {
    if (this.parsed) {
      return this.parsed;
    }
    const trace = this.trace[this.trace.length - 1];
    if (trace) {
      this.parsed = parseTraceLine(trace);
    } else {
      this.parsed = unknownParts;
    }
    return this.parsed;
  }

  get line(): number | undefined {
    return this.parse().line;
  }

  get file(): string | undefined {
    const file = this.parse().file;
    switch (file) {
      case "stdin":
        return undefined;
      default:
        return file;
    }
  }
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
          return new Traceback(error, trace);
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
  const logging = useLogging();

  useEffect(() => {
    const buffer = new TracebackScrollback();
    const dataListener = (data: string) => {
      const latest = buffer.push(data);
      setRuntimeError((current) => {
        if (!current && latest) {
          logging.event({
            type: "serial-traceback",
          });
        }
        return latest;
      });
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
  }, [device, setRuntimeError, logging]);

  return runtimeError;
};

export enum SyncStatus {
  OUT_OF_SYNC = "OUT_OF_SYNC",
  IN_SYNC = "IN_SYNC",
}

type UseSyncStatus = [SyncStatus, Dispatch<SetStateAction<SyncStatus>>];

const SyncContext = React.createContext<undefined | UseSyncStatus>(undefined);

export const useSyncStatus = (): SyncStatus => {
  const value = useContext(SyncContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value[0];
};

export const SyncStatusProvider = ({ children }: { children: ReactNode }) => {
  const syncStatusState = useState<SyncStatus>(SyncStatus.OUT_OF_SYNC);
  const [, setSyncStatus] = syncStatusState;
  const fs = useFileSystem();
  const device = useDevice();
  useEffect(() => {
    const moveToOutOfSync = () => setSyncStatus(SyncStatus.OUT_OF_SYNC);
    const moveToInSync = () => setSyncStatus(SyncStatus.IN_SYNC);
    fs.on(EVENT_TEXT_EDIT, moveToOutOfSync);
    fs.on(EVENT_PROJECT_UPDATED, moveToOutOfSync);
    device.on(EVENT_FLASH, moveToInSync);
    device.on(EVENT_STATUS, moveToOutOfSync);
    return () => {
      fs.removeListener(EVENT_TEXT_EDIT, moveToOutOfSync);
      fs.removeListener(EVENT_PROJECT_UPDATED, moveToOutOfSync);
      device.removeListener(EVENT_STATUS, moveToOutOfSync);
      device.removeListener(EVENT_FLASH, moveToInSync);
    };
  }, [fs, device, setSyncStatus]);
  return (
    <SyncContext.Provider value={syncStatusState}>
      {children}
    </SyncContext.Provider>
  );
};
