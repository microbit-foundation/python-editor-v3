import { Box, BoxProps } from "@chakra-ui/layout";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import useIsUnmounted from "../common/use-is-unmounted";
import { EVENT_SERIAL_DATA, EVENT_SERIAL_RESET } from "../device/device";
import { useDevice } from "../device/device-hooks";
import { backgroundColorTerm, codeFontFamily } from "../theme";
import { defaultCodeFontSizePt } from "../theme";

const ptToPixelRatio = 96 / 72;

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
        theme: {
          background: backgroundColorTerm,
        },
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(ref.current);

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

      // Input/output data.
      const serialListener = (data: string) => {
        if (!isUnmounted()) {
          term.write(data);
        }
      };
      device.on(EVENT_SERIAL_DATA, serialListener);
      const resetListener = () => {
        if (!isUnmounted()) {
          term.reset();
        }
      };
      device.on(EVENT_SERIAL_RESET, resetListener);
      term.onData((data: string) => {
        if (!isUnmounted()) {
          // Async for internal error handling, we don't need to wait.
          device.serialWrite(data);
        }
      });
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
