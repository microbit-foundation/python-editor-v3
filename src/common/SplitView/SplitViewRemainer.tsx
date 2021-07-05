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
  const { direction, sizedPaneSize } = useSplitViewContext();
  return (
    <Box
      {...dimensionProps(
        direction,
        `calc(100% - ${sizedPaneSize}px - ${separatorPixels}px)`
      )}
    >
      {children}
    </Box>
  );
};

export default SplitViewRemainder;
