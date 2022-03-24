/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, Icon, Text } from "@chakra-ui/react";
import { RiErrorWarningLine, RiTerminalBoxLine } from "react-icons/ri";
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
}

const syncMessages: SyncMessage[] = [
  {
    id: SyncStatus.OUT_OF_SYNC,
    message: "Running code - out of sync with editor",
    color: "yellow",
  },
  {
    id: SyncStatus.IN_SYNC,
    message: "Running code - in sync with editor",
    color: "lawngreen",
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
            <FormattedMessage id={syncMessage?.message} />
          </Text>
        )}
      </HStack>
    </HStack>
  );
};

export default SerialIndicators;
