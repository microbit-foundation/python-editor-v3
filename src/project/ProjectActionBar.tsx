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

const ProjectActionBar = (props: BoxProps) => {
  const [isWideScreen] = useMediaQuery(widthXl);
  const size = isWideScreen ? "lg" : "md";
  return (
    <HStack
      {...props}
      justifyContent="space-between"
      py={5}
      px={isWideScreen ? 10 : 5}
    >
      <SendButton size={size} />
      <HStack spacing={2.5}>
        <SaveMenuButton size={size} />
        {/* Min-width to avoid collapsing when out of space. Needs some work on responsiveness of the action bar. */}
        <OpenButton mode="button" size={size} minW="fit-content" />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
