/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiErrorWarningLine, RiTerminalBoxLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { backgroundColorTerm } from "../deployment/misc";
import { ConnectionStatus } from "../device/device";
import {
  useConnectionStatus,
  useDeviceTraceback,
} from "../device/device-hooks";
import MaybeTracebackLink from "./MaybeTracebackLink";
import XTerm from "./XTerm";

interface SerialAreaProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
}

const SerialArea = ({ compact, onSizeChange, ...props }: SerialAreaProps) => {
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  return (
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
  );
};
SerialArea.compactSize = 48;

interface SerialBarProps extends BoxProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
}

const SerialBar = ({ compact, onSizeChange, ...props }: SerialBarProps) => {
  const handleExpandCollapseClick = useCallback(() => {
    onSizeChange(compact ? "open" : "compact");
  }, [compact, onSizeChange]);
  const intl = useIntl();
  return (
    <HStack justifyContent="space-between" p={1} {...props}>
      <SerialIndicators compact={compact} overflow="hidden" />
      <IconButton
        variant="sidebar"
        color="white"
        isRound
        aria-label={
          compact
            ? intl.formatMessage({ id: "serial-expand" })
            : intl.formatMessage({ id: "serial-collapse" })
        }
        icon={<ExpandCollapseIcon open={Boolean(compact)} />}
        onClick={handleExpandCollapseClick}
      />
    </HStack>
  );
};

interface SerialIndicatorsProps extends BoxProps {
  compact?: boolean;
}

const SerialIndicators = ({ compact, ...props }: SerialIndicatorsProps) => {
  const traceback = useDeviceTraceback();
  return (
    <HStack {...props}>
      <Icon m={1} as={RiTerminalBoxLine} fill="white" boxSize={5} />
      {compact && (
        <HStack spacing={0}>
          {traceback && (
            <>
              <Icon m={1} as={RiErrorWarningLine} fill="white" boxSize={5} />
              <Text color="white" whiteSpace="nowrap">
                <MaybeTracebackLink traceback={traceback} /> {traceback.error}
              </Text>
            </>
          )}
        </HStack>
      )}
    </HStack>
  );
};

export default SerialArea;
