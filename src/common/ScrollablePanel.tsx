/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/react";
import React, { RefObject, useContext, useRef } from "react";

const ScrollablePanelContext =
  React.createContext<RefObject<HTMLDivElement> | null>(null);

/**
 * Exposes the ancesor scrollable panel.
 *
 * This should be rarely used but is needed in some circumstanced for absolute positioning.
 */
export const useScrollablePanelAncestor = () => {
  const value = useContext(ScrollablePanelContext);
  if (!value) {
    throw new Error();
  }
  return value;
};

interface ScrollablePanelProps extends BoxProps {}

/**
 * A wrapper for each area shown inside the left panel.
 */
const ScrollablePanel = ({ children, ...props }: ScrollablePanelProps) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={ref}
      flex="1 0 auto"
      overflowY="auto"
      overflowX="hidden"
      height={0}
      position="relative"
      data-testid="scrollable-panel"
      {...props}
    >
      <ScrollablePanelContext.Provider value={ref}>
        {children}
      </ScrollablePanelContext.Provider>
    </Box>
  );
};

export default ScrollablePanel;
