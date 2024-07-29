/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/layout";
import { useToken } from "@chakra-ui/react";
import React, { useEffect, useMemo, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import useActionFeedback from "../common/use-action-feedback";
import useIsUnmounted from "../common/use-is-unmounted";
import { backgroundColorTerm } from "../deployment/misc";
import { SerialDataEvent } from "@microbit/microbit-connection";
import { parseTraceLine, useDevice } from "../device/device-hooks";
import { useSelection } from "../workbench/use-selection";
import { WebLinkProvider } from "./link-provider";
import { useCurrentTerminalRef } from "./serial-hooks";
import "./xterm-custom.css";
import customKeyEventHandler from "./xterm-keyboard";

interface XTermProps extends BoxProps {
  tabOutRef: HTMLElement;
  fontSizePt: number;
}

/**
 * xterm.js-based terminal.
 */
const XTerm = ({ fontSizePt, tabOutRef, ...props }: XTermProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useManagedTermimal(ref, tabOutRef, fontSizePt);
  return <Box {...props} ref={ref} backgroundColor={backgroundColorTerm} />;
};

const ptToPixelRatio = 96 / 72;

/**
 * Manages an XTerm terminal object.
 *
 * The terminal is registered with the current terminal hook so only
 * one instance is permitted without changing that design.
 */
const useManagedTermimal = (
  ref: React.RefObject<HTMLDivElement>,
  tabOutRef: HTMLElement,
  fontSizePt: number
): void => {
  const actionFeedback = useActionFeedback();
  const codeFontFamily = useToken("fonts", "code");
  const device = useDevice();
  const isUnmounted = useIsUnmounted();
  const [, setSelection] = useSelection();
  const fitAddon = useMemo(() => new FitAddon(), []);
  const currentTerminalRef = useCurrentTerminalRef();
  const initialFontSizeRef = useRef<number>(fontSizePt);

  useEffect(() => {
    const parent = ref.current;
    if (!parent) {
      return;
    }
    if (currentTerminalRef.current) {
      throw new Error("Only one instance supported.");
    }
    const terminal = new Terminal({
      fontFamily: codeFontFamily,
      fontSize: ptToPixelRatio * initialFontSizeRef.current,
      letterSpacing: 1.1,
      screenReaderMode: true,
      theme: {
        background: backgroundColorTerm,
      },
    });

    const tracebackLinkHandler = (_e: MouseEvent, traceLine: string) => {
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
    terminal.loadAddon(fitAddon);
    terminal.attachCustomKeyEventHandler((e) =>
      customKeyEventHandler(e, tabOutRef)
    );

    const serialListener = (event: SerialDataEvent) => {
      if (!isUnmounted()) {
        terminal.write(event.data);
      }
    };
    const resetListener = () => {
      if (!isUnmounted()) {
        terminal.reset();
      }
    };
    device.addEventListener("serialdata", serialListener);
    device.addEventListener("serialreset", resetListener);
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
        // Fix for scrollbar not being draggable.
        // https://github.com/xtermjs/xterm.js/issues/2757
        const xtermScreenEl = parent.querySelector(".xterm-screen");
        const xtermAccessibilityEl = parent.querySelector(
          ".xterm-accessibility"
        );
        (xtermAccessibilityEl as HTMLElement).style.width =
          (xtermScreenEl as HTMLElement).offsetWidth + "px";
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
    // Raised https://github.com/xtermjs/xterm.js/issues/3516
    // for API in xterm.js
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
              "Started and finished MicroPython paste mode for the multi-line paste.",
            position: "bottom-right",
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
    terminal.open(parent);
    currentTerminalRef.current = terminal;

    return () => {
      currentTerminalRef.current = undefined;
      device.removeEventListener("serialreset", resetListener);
      device.removeEventListener("serialdata", serialListener);
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [
    actionFeedback,
    codeFontFamily,
    currentTerminalRef,
    device,
    isUnmounted,
    setSelection,
    fitAddon,
    initialFontSizeRef,
    tabOutRef,
    ref,
  ]);

  useEffect(() => {
    currentTerminalRef.current?.setOption(
      "fontSize",
      fontSizePt * ptToPixelRatio
    );
    try {
      fitAddon.fit();
    } catch (e) {
      // It throws if you resize it when not visible but it does no harm.
    }
  }, [currentTerminalRef, fitAddon, fontSizePt]);
};

export default XTerm;
