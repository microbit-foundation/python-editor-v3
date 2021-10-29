/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface LeftPanelTabContentProps {
  children: ReactNode;
  nav: ReactNode;
}

/**
 * A wrapper for each area shown inside the left panel.
 */
const LeftPanelTabContent = ({ children, nav }: LeftPanelTabContentProps) => {
  return (
    <Flex height="100%" direction="column">
      {nav && <HStack justifyContent="flex-end">{nav}</HStack>}
      <Box
        id="left-panel-viewport"
        flex="1 0 auto"
        overflowY="auto"
        overflowX="hidden"
        height={0}
        position="relative"
      >
        {children}
      </Box>
    </Flex>
  );
};

export default LeftPanelTabContent;
