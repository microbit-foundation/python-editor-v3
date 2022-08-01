/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import {
  dimensionProps,
  separatorPixels,
  useSplitViewContext,
} from "./context";
import { Box, BoxProps } from "@chakra-ui/layout";

interface SplitViewRemainderProps extends BoxProps {
  children: ReactNode;
}

/**
 * The pane that takes the remaining space.
 */
const SplitViewRemainder = ({
  children,
  ...props
}: SplitViewRemainderProps) => {
  const { direction, sizedPaneSize, compactSize, mode, dragging } =
    useSplitViewContext();
  // We're the remainder, so figure out our size given the other cases.
  const remainingSpace = (() => {
    switch (mode) {
      case "collapsed":
        return "100%";
      case "open":
        return `calc(100% - ${sizedPaneSize}px - ${separatorPixels}px)`;
      case "compact":
        return `calc(100% - ${compactSize}px)`;
    }
  })();
  return (
    <Box
      {...dimensionProps(direction, remainingSpace)}
      pointerEvents={dragging ? "none" : "unset"}
      {...props}
    >
      {children}
    </Box>
  );
};

export default SplitViewRemainder;
