/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack } from "@chakra-ui/react";
import ConnectDisconnectButton from "./ConnectDisconnectButton";
import DownloadFlashButton from "./DownloadFlashButton";
import LoadButton from "./LoadButton";

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
      <HStack spacing={2.5}>
        <DownloadFlashButton size={size} />
        <ConnectDisconnectButton />
      </HStack>
      {/* Min-width to avoid collapsing when out of space. Needs some work on responsiveness of the action bar. */}
      <LoadButton mode="button" size={size} minW="fit-content" />
    </HStack>
  );
};

export default ProjectActionBar;
