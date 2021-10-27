/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, VStack } from "@chakra-ui/layout";
import { ReactNode } from "react";

interface ToolkitLevelProps extends BoxProps {
  heading: ReactNode;
  children: ReactNode;
}

const ToolkitLevel = ({ heading, children, ...props }: ToolkitLevelProps) => (
  <VStack alignItems="stretch" spacing={0} {...props}>
    <Box
      minHeight="28"
      backgroundColor="rgb(230, 232, 239)"
      flex="0 0 auto"
      p={3}
      pl={5}
      pr={5}
      position="sticky"
      top="0"
      zIndex={2} // Above code pop-up.
    >
      {heading}
    </Box>
    {children}
  </VStack>
);

export default ToolkitLevel;
