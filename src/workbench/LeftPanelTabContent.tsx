import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import LogoBar from "../common/LogoBar";

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
      <VStack alignItems="stretch" spacing={0}>
        <LogoBar />
        {nav && <HStack justifyContent="flex-end">{nav}</HStack>}
      </VStack>
      <Box flex="1 0 auto" overflowY="auto" height={0}>
        {children}
      </Box>
    </Flex>
  );
};

export default LeftPanelTabContent;
