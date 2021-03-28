import { Box, Flex, HStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";

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
      <HStack justifyContent="flex-end">{nav}</HStack>
      <Box flex="1 0 auto" overflowY="auto" height={0}>
        {children}
      </Box>
    </Flex>
  );
};

export default LeftPanelTabContent;
