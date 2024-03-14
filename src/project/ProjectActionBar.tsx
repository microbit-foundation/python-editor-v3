/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, useMediaQuery } from "@chakra-ui/react";
import SendButton from "./SendButton";
import SaveMenuButton from "./SaveMenuButton";
import OpenButton from "./OpenButton";
import { widthXl } from "../common/media-queries";
import React, { ForwardedRef } from "react";

interface ProjectActionBarProps extends BoxProps {
  sendButtonRef: React.RefObject<HTMLButtonElement>;
}

const ProjectActionBar = React.forwardRef(
  (
    { sendButtonRef, ...props }: ProjectActionBarProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const [isWideScreen] = useMediaQuery(widthXl, { ssr: false });
    const size = "lg";
    return (
      <HStack
        {...props}
        justifyContent="space-between"
        py={5}
        px={isWideScreen ? 10 : 5}
      >
        <SendButton size={size} ref={ref} sendButtonRef={sendButtonRef} />
        <HStack spacing={2.5}>
          <SaveMenuButton size={size} />
          {/* Min-width to avoid collapsing when out of space. Needs some work on responsiveness of the action bar. */}
          <OpenButton mode="button" size={size} minW="fit-content" />
        </HStack>
      </HStack>
    );
  }
);

export default ProjectActionBar;
