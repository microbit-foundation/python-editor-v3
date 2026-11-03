/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode, use, useMemo, useRef } from "react";
import { Terminal } from "xterm";
import { useDevice } from "../device/device-hooks";
import { useLogging } from "../logging/logging-hooks";
import { SerialActions } from "./serial-actions";

/**
 * UI-level actions for the serial area.
 */
export const useSerialActions = (
  // We should pull this out into a workspace layout context.
  onSerialSizeChange: (size: "compact" | "open") => void
) => {
  const device = useDevice();
  const terminal = useCurrentTerminalRef();
  const logging = useLogging();
  return useMemo(
    () => new SerialActions(terminal, device, onSerialSizeChange, logging),
    [terminal, device, onSerialSizeChange, logging]
  );
};

const InternalTerminalContext = React.createContext<
  React.MutableRefObject<Terminal | undefined> | undefined
>(undefined);

/**
 * A context that owns an xterm.js terminal.
 *
 * Nest an Xterm component to render the terminal.
 */
export const TerminalContext = ({ children }: { children: ReactNode }) => {
  const terminal = useRef<Terminal | undefined>(undefined);
  return (
    <InternalTerminalContext value={terminal}>
      {children}
    </InternalTerminalContext>
  );
};

/**
 * Hook to access the current terminal from UI code.
 *
 * Prefer {@link #useSerialActions}.
 *
 * @returns The terminal.
 */
export const useCurrentTerminalRef = () => {
  const ref = use(InternalTerminalContext);
  if (!ref) {
    throw new Error("Missing provider.");
  }
  return ref;
};
