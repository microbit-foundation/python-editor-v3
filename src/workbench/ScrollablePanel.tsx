/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface ScrollablePanelProps {
  children: ReactNode;
}

/**
 * A wrapper for each area shown inside the left panel.
 */
const ScrollablePanel = ({ children }: ScrollablePanelProps) => {
  return (
    <Box
      // This needs to go, as we have four of them!
      id="left-panel-viewport"
      flex="1 0 auto"
      overflowY="auto"
      overflowX="hidden"
      height={0}
      position="relative"
    >
      {children}
    </Box>
  );
};

export default ScrollablePanel;
