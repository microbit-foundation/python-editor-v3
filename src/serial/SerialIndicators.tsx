/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { GoCheck } from "react-icons/go";
import {
  RiErrorWarningLine,
  RiFlashlightFill,
  RiTerminalBoxLine,
} from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { SyncStatus, Traceback, useSyncStatus } from "../device/device-hooks";
import MaybeTracebackLink from "./MaybeTracebackLink";

interface SerialIndicatorsProps extends BoxProps {
  compact?: boolean;
  traceback?: Traceback | undefined;
}

const syncMessages = {
  [SyncStatus.OUT_OF_SYNC]: {
    message: "serial-ready-to-flash",
    icon: RiFlashlightFill,
  },
  [SyncStatus.IN_SYNC]: {
    message: "serial-flashed",
    icon: GoCheck,
  },
};

/**
 * Icon and traceback status.
 */
const SerialIndicators = ({
  compact,
  traceback,
  ...props
}: SerialIndicatorsProps) => {
  const syncStatus = useSyncStatus();
  const syncMessage = syncMessages[syncStatus];
  return (
    <HStack {...props}>
      <Icon m={1} as={RiTerminalBoxLine} fill="white" boxSize={5} />
      <HStack spacing={0}>
        {compact && traceback && syncStatus === SyncStatus.IN_SYNC && (
          <>
            <Icon m={1} as={RiErrorWarningLine} fill="white" boxSize={5} />
            <Text color="white" whiteSpace="nowrap" data-testid="traceback">
              <MaybeTracebackLink traceback={traceback} />
            </Text>
          </>
        )}
        {(!traceback ||
          (traceback && syncStatus === SyncStatus.OUT_OF_SYNC)) && (
          <Text color="white">
            <Flex align="center">
              <FormattedMessage id={syncMessage?.message} />
              {syncMessage?.icon && (
                <Icon ml={1} as={syncMessage?.icon} fill="white" boxSize={5} />
              )}
            </Flex>
          </Text>
        )}
      </HStack>
    </HStack>
  );
};

export default SerialIndicators;
