/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import {
  RiCheckLine,
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

interface SyncMessage {
  id: SyncStatus;
  message: string;
  color: string;
  icon?: IconType;
}

const syncMessages: SyncMessage[] = [
  {
    id: SyncStatus.OUT_OF_SYNC,
    message: "micro:bit ready to flash",
    color: "yellow",
    icon: RiFlashlightFill,
  },
  {
    id: SyncStatus.IN_SYNC,
    message: "micro:bit flashed",
    color: "lawngreen",
    icon: RiCheckLine,
  },
];

/**
 * Icon and traceback status.
 */
const SerialIndicators = ({
  compact,
  traceback,
  ...props
}: SerialIndicatorsProps) => {
  const [syncStatus] = useSyncStatus();
  const syncMessage = syncMessages.find((m) => m.id === syncStatus);
  return (
    <HStack {...props}>
      <Icon m={1} as={RiTerminalBoxLine} fill="white" boxSize={5} />
      <HStack spacing={0}>
        {compact && traceback && (
          <>
            <Icon m={1} as={RiErrorWarningLine} fill="white" boxSize={5} />
            <Text color="white" whiteSpace="nowrap" data-testid="traceback">
              <MaybeTracebackLink traceback={traceback} /> {traceback.error}
            </Text>
          </>
        )}
        {!traceback && (
          <Text color={syncMessage?.color}>
            <Flex align="center">
              <FormattedMessage id={syncMessage?.message} />
              {syncMessage?.icon && (
                <Icon
                  ml={1}
                  as={syncMessage?.icon}
                  fill={syncMessage?.color}
                  boxSize={5}
                />
              )}
            </Flex>
          </Text>
        )}
      </HStack>
    </HStack>
  );
};

export default SerialIndicators;
