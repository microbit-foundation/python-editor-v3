/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createRef, useEffect } from "react";
import { dimensionPropName, useSplitViewContext } from "./context";
import { Box } from "@chakra-ui/layout";

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
      visibility={mode === "collapsed" ? "hidden" : undefined}
      ref={ref}
    >
      {children}
    </Box>
  );
};

export default SplitViewSized;
