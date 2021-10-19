/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode, useContext, useEffect, useMemo } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import useActionFeedback from "../common/use-action-feedback";
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

/**
 * UI-level actions for the serial area.
 */
export const useSerialActions = (
  // We should pull this out into a workspace layout context.
  onSerialSizeChange: (size: "compact" | "open") => void
) => {
  const device = useDevice();
  const terminal = useTerminal();
  return useMemo(
    () => new SerialActions(terminal, device, onSerialSizeChange),
    [terminal, device, onSerialSizeChange]
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
  const actionFeedback = useActionFeedback();
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

    // Fragile interception of paste events.
    // We should see if we can get API for this in xterm.js.
    const coreTerminal = (terminal as any)._core;
    const initGlobal = coreTerminal._initGlobal.bind(coreTerminal);
    const customPasteEventHandler = (event: ClipboardEvent) => {
      // Avoid the handler xterm.js will add.
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      if (event.clipboardData) {
        let text = event.clipboardData.getData("text/plain");
        if (/[\n\r]/.test(text)) {
          actionFeedback.info({
            title:
              "Automatically switched to MicroPython paste mode for multi-line paste.",
          });
          // Wrap in start/end paste mode to prevent auto-indent.
          text = `\x05${text}\x04`;
        }
        terminal.paste(text);
      }
    };
    coreTerminal._initGlobal = () => {
      // We don't need to remove these as we share a lifetime with this DOM.
      terminal.element!.addEventListener("paste", customPasteEventHandler);
      terminal.textarea!.addEventListener("paste", customPasteEventHandler);
      initGlobal();
    };

    return () => {
      device.removeListener(EVENT_SERIAL_RESET, resetListener);
      device.removeListener(EVENT_SERIAL_DATA, serialListener);
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [actionFeedback, device, setSelection, isUnmounted, terminal]);

  return terminal;
};

const InternalTerminalContext = React.createContext<undefined | Terminal>(
  undefined
);

/**
 * A context that owns an xterm.js terminal.
 *
 * Nest an Xterm component to render the terminal.
 */
export const TerminalContext = ({ children }: { children: ReactNode }) => {
  const terminal = useNewTerminal();
  return (
    <InternalTerminalContext.Provider value={terminal}>
      {children}
    </InternalTerminalContext.Provider>
  );
};

/**
 * Hook to access the terminal from UI code.
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
