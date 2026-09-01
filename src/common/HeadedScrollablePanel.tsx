/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider } from "@microbit/ui";
import { ReactNode } from "react";
import { css } from "styled-system/css";
import { Box, VStack, styled } from "styled-system/jsx";
import ScrollablePanel from "./ScrollablePanel";

// The overshooting cubic-bezier (y > 1) slides the panel slightly past its
// resting position and settles it back, giving a spring-like entrance.
// Deliberately no fill mode: once the animation ends no transform remains
// to create a stacking context over the panel's descendants.
const slideClassNames: Record<string, string | undefined> = {
  forward: css({
    animationName: "slideInForward",
    animationDuration: "0.5s",
    animationTimingFunction: "cubic-bezier(0.33, 1.15, 0.55, 1)",
    _motionReduce: { animationName: "none" },
  }),
  back: css({
    animationName: "slideInBack",
    animationDuration: "0.5s",
    animationTimingFunction: "cubic-bezier(0.33, 1.15, 0.55, 1)",
    _motionReduce: { animationName: "none" },
  }),
  none: undefined,
};

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
    <VStack
      className={slideClassNames[direction]}
      alignItems="stretch"
      gap="0"
      role="document"
    >
      {heading ? (
        <Box
          bg="gray.75"
          flex="0 0 auto"
          position="sticky"
          top="0"
          zIndex="breadcrumbContainer"
        >
          {/* Use of header here is relied on to correctly offset the scrolling based on the actual height of the sticky header. See Highlight.tsx */}
          <styled.header>{heading}</styled.header>
          <Divider thickness="thick" />
        </Box>
      ) : null}
      {children}
    </VStack>
  </ScrollablePanel>
);

export default HeadedScrollablePanel;
