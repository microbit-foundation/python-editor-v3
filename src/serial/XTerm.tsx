import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const XTerm = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const terminal = new Terminal();
      terminal.open(ref.current);
    }
  }, []);
  return <div ref={ref} />;
};

export default XTerm;
