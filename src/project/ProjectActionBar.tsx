/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, HStack } from "@chakra-ui/react";
import { useRef } from "react";
import { useResizeObserverContentRect } from "../common/use-resize-observer";
import ConnectDisconnectButton from "./ConnectDisconnectButton";
import DownloadFlashButton from "./DownloadFlashButton";
import LoadButton from "./LoadButton";

const ProjectActionBar = (props: BoxProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useResizeObserverContentRect(ref);
  const size = rect && rect.width < 620 ? "md" : "lg";
  const loadMode = rect && rect.width < 500 ? "icon" : "button";
  return (
    <Box {...props} ref={ref}>
      <HStack justifyContent="space-between" py={5} px={size === "md" ? 5 : 10}>
        <HStack spacing={2.5}>
          <DownloadFlashButton size={size} />
          <ConnectDisconnectButton size={size} />
        </HStack>
        <LoadButton mode={loadMode} size={size} />
      </HStack>
    </Box>
  );
};

export default ProjectActionBar;
