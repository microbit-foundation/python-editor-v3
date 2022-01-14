/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, VStack, Divider } from "@chakra-ui/layout";
import { ReactNode } from "react";
import ScrollablePanel from "../../workbench/ScrollablePanel";
import Slide from "./Slide";

interface ToolkitLevelProps extends BoxProps {
  direction: "forward" | "back" | "none";
  heading: ReactNode;
  children: ReactNode;
}

const ToolkitLevel = ({
  direction,
  heading,
  children,
  ...props
}: ToolkitLevelProps) => (
  <ScrollablePanel>
    <Slide direction={direction}>
      <VStack alignItems="stretch" spacing={0} {...props}>
        <Box
          bg="gray.25"
          flex="0 0 auto"
          position="sticky"
          top="0"
          zIndex={2} // Above code pop-up.
        >
          <Box p={5} pt={3}>
            {heading}
          </Box>
          <Divider borderWidth="1px" />
        </Box>

        {children}
      </VStack>
    </Slide>
  </ScrollablePanel>
);

export default ToolkitLevel;
