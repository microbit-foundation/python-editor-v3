/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode, useContext, useEffect, useMemo } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import useIsUnmounted from "../common/use-is-unmounted";
import {
  backgroundColorTerm,
  codeFontFamily,
  defaultCodeFontSizePt,
} from "../deployment/misc";
import { EVENT_SERIAL_DATA, EVENT_SERIAL_RESET } from "../device/device";
import { parseTraceLine, useDevice } from "../device/device-hooks";
import { useSelection } from "../workbench/use-selection";
import { WebLinkProvider } from "./link-provider";
import { SerialActions } from "./serial-actions";
import customKeyEventHandler from "./xterm-keyboard";

export const useSerialActions = (
  // We should pull this out into a workspace layout context.
  onSerialSizeChange: (size: "compact" | "open") => void
) => {
  const device = useDevice();
  return useMemo(
    () => new SerialActions(device, onSerialSizeChange),
    [device, onSerialSizeChange]
  );
};

const ptToPixelRatio = 96 / 72;

/**
 * Manages an XTerm terminal object.
 *
 * It's often useful to have this higher up the tree than its presentation
 * so its API can be used to implement user actions.
 */
const useNewTerminal = (): Terminal => {
  const terminal = useMemo(() => {
    return new Terminal({
      fontFamily: codeFontFamily,
      fontSize: defaultCodeFontSizePt * ptToPixelRatio,
      letterSpacing: 1.1,
      screenReaderMode: true,
      theme: {
        background: backgroundColorTerm,
      },
    });
  }, []);

  const device = useDevice();
  const isUnmounted = useIsUnmounted();
  const [, setSelection] = useSelection();
  useEffect(() => {
    const tracebackLinkHandler = (e: MouseEvent, traceLine: string) => {
      const { file, line } = parseTraceLine(traceLine);
      if (file) {
        setSelection({ file, location: { line } });
      }
    };

    // Group 1 is underlined by xterm.js
    const tracebackRegExpMatch = /^ {2}(File "[^"]+", line \d+)/;
    terminal.registerLinkProvider(
      new WebLinkProvider(
        terminal,
        tracebackRegExpMatch,
        tracebackLinkHandler,
        {}
      )
    );
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.attachCustomKeyEventHandler(customKeyEventHandler);

    const serialListener = (data: string) => {
      if (!isUnmounted()) {
        terminal.write(data);
      }
    };
    const resetListener = () => {
      if (!isUnmounted()) {
        terminal.reset();
      }
    };
    device.on(EVENT_SERIAL_DATA, serialListener);
    device.on(EVENT_SERIAL_RESET, resetListener);
    terminal.onData((data: string) => {
      if (!isUnmounted()) {
        // Async for internal error handling, we don't need to wait.
        device.serialWrite(data);
      }
    });

    // Watch for resize and change terminal rows/cols accordingly.
    // This can result in a slither of space at the bottom, so backgrounds
    // should match.
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      try {
        fitAddon.fit();
      } catch (e) {
        // It throws if you resize it when not visible but it does no harm.
      }
    });
    const terminalOpen = terminal.open.bind(terminal);
    terminal.open = (parent: HTMLElement) => {
      terminalOpen(parent);
      resizeObserver.observe(parent);
    };
    return () => {
      device.removeListener(EVENT_SERIAL_RESET, resetListener);
      device.removeListener(EVENT_SERIAL_DATA, serialListener);
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [device, setSelection, isUnmounted, terminal]);

  return terminal;
};

const InternalTerminalContext = React.createContext<undefined | Terminal>(
  undefined
);

export const TerminalContext = ({ children }: { children: ReactNode }) => {
  const terminal = useNewTerminal();
  return (
    <InternalTerminalContext.Provider value={terminal}>
      {children}
    </InternalTerminalContext.Provider>
  );
};

/**
 * Hook to access the termimal from UI code.
 *
 * Prefer {@link #useSerialActions}.
 *
 * @returns The terminal.
 */
export const useTerminal = () => {
  const device = useContext(InternalTerminalContext);
  if (!device) {
    throw new Error("Missing provider.");
  }
  return device;
};
