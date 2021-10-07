/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import "./LeftPanelTabContent.css";

interface LeftPanelTabContentProps {
  title: string;
  children: ReactNode;
  nav: ReactNode;
}

/**
 * A wrapper for each area shown inside the left panel.
 */
const LeftPanelTabContent = ({
  title,
  children,
  nav,
}: LeftPanelTabContentProps) => {
  return (
    <Flex height="100%" direction="column">
      {nav && <HStack justifyContent="flex-end">{nav}</HStack>}
      <Box
        className="left-panel-content"
        flex="1 0 auto"
        overflowY={"overlay" as any}
        overflowX="hidden"
        height={0}
      >
        {children}
      </Box>
    </Flex>
  );
};

export default LeftPanelTabContent;
