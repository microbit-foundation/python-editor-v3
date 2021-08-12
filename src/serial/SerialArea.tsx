/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { backgroundColorTerm } from "../deployment/misc";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import { TerminalContext } from "./serial-hooks";
import SerialBar from "./SerialBar";
import XTerm from "./XTerm";

interface SerialAreaProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
}

/**
 * The serial area below the editor.
 *
 * This has a compact and expanded form and coordinates its
 * size with the workspace layout via compact/onSizeChange.
 */
const SerialArea = ({ compact, onSizeChange, ...props }: SerialAreaProps) => {
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  return (
    <TerminalContext>
      <Flex
        {...props}
        flexDirection="column"
        alignItems="stretch"
        height="100%"
        position="relative"
        overflow="hidden"
      >
        {!connected ? null : (
          <Box
            alignItems="stretch"
            backgroundColor={backgroundColorTerm}
            spacing={0}
            height="100%"
          >
            <SerialBar
              height={12}
              compact={compact}
              onSizeChange={onSizeChange}
            />
            <XTerm
              visibility={compact ? "hidden" : undefined}
              height={`calc(100% - ${SerialArea.compactSize}px)`}
              ml={1}
              mr={1}
            />
          </Box>
        )}
      </Flex>
    </TerminalContext>
  );
};
SerialArea.compactSize = 48;

export default SerialArea;
