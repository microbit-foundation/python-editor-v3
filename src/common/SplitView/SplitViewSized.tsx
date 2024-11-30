/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@chakra-ui/layout";
import { createRef, useEffect } from "react";
import { dimensionPropName, useSplitViewContext } from "./context";

interface SizedPaneProps {
  children: JSX.Element;
}

/**
 * The pane we give an explicit size to.
 *
 * The other pane takes the remaining space.
 */
const SplitViewSized = ({ children }: SizedPaneProps) => {
  const { direction, sizedPaneSize, compactSize, mode, dragging } =
    useSplitViewContext();
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    if (ref.current) {
      const size = (() => {
        switch (mode) {
          case "collapsed":
            return "0px";
          case "open":
            return `${sizedPaneSize}px`;
          case "compact":
            return `${compactSize}px`;
        }
      })();
      ref.current.style[dimensionPropName(direction)] = size;
    }
  }, [ref, mode, direction, sizedPaneSize, compactSize]);
  return (
    <Box
      pointerEvents={dragging ? "none" : "unset"}
      display={mode === "collapsed" ? "none" : undefined}
      visibility={mode === "collapsed" ? "hidden" : undefined}
      ref={ref}
    >
      {children}
    </Box>
  );
};

export default SplitViewSized;
