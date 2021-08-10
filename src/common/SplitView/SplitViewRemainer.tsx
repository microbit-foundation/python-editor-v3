import { ReactNode } from "react";
import {
  dimensionProps,
  separatorPixels,
  useSplitViewContext,
} from "./context";
import { Box } from "@chakra-ui/layout";

/**
 * The pane that takes the remaining space.
 */
const SplitViewRemainder = ({ children }: { children: ReactNode }) => {
  const { direction, sizedPaneSize, compactSize, mode } = useSplitViewContext();
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
  return <Box {...dimensionProps(direction, remainingSpace)}>{children}</Box>;
};

export default SplitViewRemainder;
