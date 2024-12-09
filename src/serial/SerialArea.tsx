/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { backgroundColorTerm } from "../deployment/misc";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { useConnectionStatus } from "../device/device-hooks";
import { TerminalContext } from "./serial-hooks";
import SerialBar from "./SerialBar";
import XTerm from "./XTerm";

interface SerialAreaProps extends BoxProps {
  compact?: boolean;
  expandDirection: "up" | "down";
  onSizeChange: (size: "compact" | "open") => void;
  showSyncStatus: boolean;
  terminalFontSizePt: number;
  hideExpandTextOnTraceback?: boolean;
  showHintsAndTips?: boolean;
  tabOutRef: HTMLElement;
}

/**
 * The serial area.
 *
 * This is used below the editor (connected via WebUSB) and in the simulator.
 *
 * This has a compact and expanded form and coordinates its
 * size with the workspace layout via compact/onSizeChange.
 */
const SerialArea = ({
  compact,
  onSizeChange,
  showSyncStatus,
  terminalFontSizePt,
  expandDirection,
  hideExpandTextOnTraceback = false,
  showHintsAndTips = true,
  tabOutRef,
  ...props
}: SerialAreaProps) => {
  const status = useConnectionStatus();
  const connected = status === ConnectionStatus.CONNECTED;
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
            height="100%"
          >
            <SerialBar
              height={12}
              compact={compact}
              onSizeChange={onSizeChange}
              showSyncStatus={showSyncStatus}
              expandDirection={expandDirection}
              hideExpandTextOnTraceback={hideExpandTextOnTraceback}
              showHintsAndTips={showHintsAndTips}
            />
            <XTerm
              visibility={compact ? "hidden" : undefined}
              height={`calc(100% - ${SerialArea.compactSize}px)`}
              ml={1}
              mr={1}
              fontSizePt={terminalFontSizePt}
              tabOutRef={tabOutRef}
            />
          </Box>
        )}
      </Flex>
    </TerminalContext>
  );
};
SerialArea.compactSize = 43.19;

export default SerialArea;
