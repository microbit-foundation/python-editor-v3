import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { EVENT_SERIAL_DATA } from "../device/device";
import { useDevice } from "../device/device-hooks";

const XTerm = () => {
  const device = useDevice();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const terminal = new Terminal();
      terminal.open(ref.current);

      device.on(EVENT_SERIAL_DATA, (data) => {
        terminal.write(data);
      });
      terminal.onData((data) => {
        device.serialWrite(data);
      });
      // TODO: some kind of reset event?
    }
  }, [device]);
  return <div ref={ref} />;
};

export default XTerm;
