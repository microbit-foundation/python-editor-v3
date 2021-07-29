/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { RiErrorWarningLine, RiTerminalBoxLine } from "react-icons/ri";
import { backgroundColorTerm } from "../deployment/misc";
import { ConnectionStatus } from "../device/device";
import {
  Traceback,
  useConnectionStatus,
  useDeviceTraceback,
} from "../device/device-hooks";
import XTerm from "./XTerm";

const SerialArea = (props: BoxProps) => {
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
      {!connected ? null : <SerialSummaryAndTermimal height="100%" />}
    </Flex>
  );
};

const formatTracebackLastLine = (traceback: Traceback) => {
  const last = traceback.trace[traceback.trace.length - 1];
  if (!last) {
    return undefined;
  }
  return last.replace(/^File/, " in file");
};

const SerialIndicators = () => {
  const traceback = useDeviceTraceback();
  return (
    <HStack>
      <Icon m={1} as={RiTerminalBoxLine} fill="white" boxSize={5} />
      <HStack spacing={0}>
        {traceback && (
          <>
            <Icon m={1} as={RiErrorWarningLine} fill="white" boxSize={5} />
            <Text color="white">
              {traceback.error} {formatTracebackLastLine(traceback)}
            </Text>
          </>
        )}
      </HStack>
    </HStack>
  );
};

const SerialSummary = (props: BoxProps) => {
  return (
    <HStack justifyContent="space-between" p={1} {...props}>
      <SerialIndicators />
      <IconButton
        variant="sidebar"
        color="white"
        isRound
        aria-label="Open"
        icon={<ChevronUpIcon />}
      />
    </HStack>
  );
};

const SerialSummaryAndTermimal = (props: BoxProps) => {
  return (
    <Box
      alignItems="stretch"
      backgroundColor={backgroundColorTerm}
      spacing={0}
      {...props}
    >
      <SerialSummary height={12} />
      <XTerm height="calc(100% - 40px)" ml={1} mr={1} />
    </Box>
  );
};

export default SerialArea;
