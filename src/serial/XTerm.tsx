/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/layout";
import { useEffect, useRef } from "react";
import wrap from "word-wrap";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import useIsUnmounted from "../common/use-is-unmounted";
import {
  backgroundColorTerm,
  codeFontFamily,
  defaultCodeFontSizePt,
} from "../deployment/misc";
import { EVENT_SERIAL_DATA, EVENT_SERIAL_RESET } from "../device/device";
import { useDevice } from "../device/device-hooks";
import "./xterm-custom.css";

const ptToPixelRatio = 96 / 72;

const introText = `This box will show errors and things you print. Try

print("Hello, World")

You can press Ctrl-C to interrupt the micro:bit program then type Python commands directly to your micro:bit
`;

const XTerm = (props: BoxProps) => {
  const device = useDevice();

  const ref = useRef<HTMLDivElement>(null);
  const isUnmounted = useIsUnmounted();
  useEffect(() => {
    if (ref.current && !isUnmounted()) {
      const term = new Terminal({
        fontFamily: codeFontFamily,
        fontSize: defaultCodeFontSizePt * ptToPixelRatio,
        letterSpacing: 1.1,
        screenReaderMode: true,
        theme: {
          background: backgroundColorTerm,
        },
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(ref.current);

      let firstWrite = true;
      const serialListener = (data: string) => {
        if (!isUnmounted()) {
          if (firstWrite) {
            // Separate from intro text. We do it now to prevent scrolling a line off unnecessarily.
            firstWrite = false;
            data = "\r\n\r\n" + data;
          }
          term.write(data);
        }
      };
      const resetListener = () => {
        if (!isUnmounted()) {
          term.reset();
        }
      };

      let firstResize = true;
      term.onResize(() => {
        // We need to wait until we have the initial size to wrap the intro text.
        if (firstResize) {
          firstResize = false;
          const wrapped = wrap(introText, {
            width: term.cols - 2,
            newline: "\r\n",
            trim: true,
            indent: "",
          });
          term.write(wrapped, () => {
            term.scrollToTop();

            // Start listening for data.
            device.on(EVENT_SERIAL_DATA, serialListener);
            device.on(EVENT_SERIAL_RESET, resetListener);
            term.onData((data: string) => {
              if (!isUnmounted()) {
                // Async for internal error handling, we don't need to wait.
                device.serialWrite(data);
              }
            });
          });
        }
      });

      // Watch for resize and change terminal rows/cols accordingly.
      // This can result in a slither of space at the bottom, so backgrounds
      // should match.
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        fitAddon.fit();
      });
      resizeObserver.observe(ref.current);

      return () => {
        device.removeListener(EVENT_SERIAL_RESET, resetListener);
        device.removeListener(EVENT_SERIAL_DATA, serialListener);
        resizeObserver.disconnect();
        term.dispose();
      };
    }
  }, [device, isUnmounted]);

  // The terminal itself is sized based on the number of rows,
  // so we need a background that matches the theme.
  return <Box {...props} ref={ref} backgroundColor={backgroundColorTerm} />;
};

export default XTerm;
