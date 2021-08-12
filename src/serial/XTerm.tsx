/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/layout";
import { useEffect, useRef } from "react";
import "xterm/css/xterm.css";
import { backgroundColorTerm } from "../deployment/misc";
import { useTerminal } from "./serial-hooks";
import "./xterm-custom.css";

interface XTermProps extends BoxProps {}

/**
 * xterm.js-based terminal.
 *
 * Most the relevant code is in the useTerminal hook.
 */
const XTerm = ({ ...props }: XTermProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const terminal = useTerminal();
  useEffect(() => {
    if (ref.current) {
      terminal.open(ref.current);
    }
  }, [terminal]);
  return <Box {...props} ref={ref} backgroundColor={backgroundColorTerm} />;
};

export default XTerm;
