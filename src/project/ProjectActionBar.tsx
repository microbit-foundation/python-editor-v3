/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, useMediaQuery } from "@chakra-ui/react";
import SendButton from "./SendButton";
import SaveMenuButton from "./SaveMenuButton";
import OpenButton from "./OpenButton";

const ProjectActionBar = (props: BoxProps) => {
  const [isLargeScreen] = useMediaQuery("(min-width: 80em)");
  const size = isLargeScreen ? "lg" : "md";
  return (
    <HStack
      {...props}
      justifyContent="space-between"
      py={5}
      px={[5, 5, 5, 5, 10]}
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
