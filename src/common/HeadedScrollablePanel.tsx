/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider } from "@microbit/ui";
import { ReactNode } from "react";
import { Box, VStack, styled } from "styled-system/jsx";
import ScrollablePanel from "./ScrollablePanel";
import Slide from "./Slide";

interface HeadedScrollablePanelProps {
  direction?: "forward" | "back" | "none";
  heading?: ReactNode;
  children: ReactNode;
}

const HeadedScrollablePanel = ({
  direction = "none",
  heading,
  children,
}: HeadedScrollablePanelProps) => (
  <ScrollablePanel>
    <Slide direction={direction}>
      <VStack alignItems="stretch" gap="0" role="document">
        {heading && (
          <Box
            bg="gray.25"
            flex="0 0 auto"
            position="sticky"
            top="0"
            zIndex="breadcrumbContainer"
          >
            {/* Use of header here is relied on to correctly offset the scrolling based on the actual height of the sticky header. See Highlight.tsx */}
            <styled.header>{heading}</styled.header>
            <Divider />
          </Box>
        )}
        {children}
      </VStack>
    </Slide>
  </ScrollablePanel>
);

export default HeadedScrollablePanel;
