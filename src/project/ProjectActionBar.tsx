/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack } from "@chakra-ui/react";
import SendButton from "./SendButton";
import DownloadMenuButton from "./DownloadMenuButton";
import OpenButton from "./OpenButton";

const ProjectActionBar = (props: BoxProps) => {
  const size = "lg";
  return (
    <HStack
      {...props}
      justifyContent="space-between"
      pt={5}
      pb={5}
      pl={10}
      pr={10}
    >
      <SendButton size={size} />
      <HStack spacing={2.5}>
        <DownloadMenuButton size={size} />
        {/* Min-width to avoid collapsing when out of space. Needs some work on responsiveness of the action bar. */}
        <OpenButton mode="button" size={size} minW="fit-content" />
      </HStack>
    </HStack>
  );
};

export default ProjectActionBar;
