import { Box, BoxProps } from "@chakra-ui/layout";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { EVENT_SERIAL_DATA } from "../device/device";
import { useDevice } from "../device/device-hooks";
import { FitAddon } from "xterm-addon-fit";
import useIsUnmounted from "../common/use-is-unmounted";

const XTerm = (props: BoxProps) => {
  const device = useDevice();
  const ref = useRef<HTMLDivElement>(null);
  const isUnmounted = useIsUnmounted();
  useEffect(() => {
    if (ref.current && !isUnmounted()) {
      const term = new Terminal({});
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
        term.write(data);
      };
      device.on(EVENT_SERIAL_DATA, serialListener);
      term.onData(device.serialWrite.bind(device));
      // TODO: some kind of reset event, to clear the terminal?
      //       or depend on the connection status?

      return () => {
        device.removeListener(EVENT_SERIAL_DATA, serialListener);
        resizeObserver.disconnect();
        term.dispose();
      };
    }
  }, [device]);
  return <Box {...props} ref={ref} />;
};

export default XTerm;
