/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Divider, VStack } from "@chakra-ui/layout";
import { ReactNode } from "react";
import { zIndexBreadcrumbContainer } from "../common/zIndex";
import ScrollablePanel from "./ScrollablePanel";
import Slide from "./Slide";

interface HeadedScrollablePanelProps extends BoxProps {
  direction?: "forward" | "back" | "none";
  heading?: ReactNode;
  children: ReactNode;
}

const HeadedScrollablePanel = ({
  direction = "none",
  heading,
  children,
  ...props
}: HeadedScrollablePanelProps) => (
  <ScrollablePanel>
    <Slide direction={direction}>
      <VStack alignItems="stretch" spacing={0} {...props} role="document">
        {heading && (
          <Box
            bg="gray.25"
            flex="0 0 auto"
            position="sticky"
            top="0"
            zIndex={zIndexBreadcrumbContainer}
          >
            {/* Use of header here is relied on to correctly offset the scrolling based on the actual height of the sticky header. See Highlight.tsx */}
            <Box as="header">{heading}</Box>
            <Divider borderWidth="1px" />
          </Box>
        )}
        {children}
      </VStack>
    </Slide>
  </ScrollablePanel>
);

export default HeadedScrollablePanel;
