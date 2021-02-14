import { Box, Flex, Text } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface SidePanelTabContentProps {
  title: string;
  children: ReactNode;
}

const SidePanelTabContent = ({ title, children }: SidePanelTabContentProps) => {
  return (
    <Flex height="100%" direction="column">
      <Text flex="0 0 auto" as="h3" fontSize="lg" fontWeight="bold" p="9px">
        {title}
      </Text>
      <Box flex="1 0 auto">{children}</Box>
    </Flex>
  );
};

export default SidePanelTabContent;
