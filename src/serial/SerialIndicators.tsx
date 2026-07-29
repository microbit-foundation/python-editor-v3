/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon, Text } from "@microbit/ui";
import { GoCheck } from "react-icons/go";
import {
  RiErrorWarningLine,
  RiFlashlightFill,
  RiTerminalBoxLine,
} from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { HStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { SyncStatus, Traceback, useSyncStatus } from "../device/device-hooks";
import MaybeTracebackLink from "./MaybeTracebackLink";

interface SerialIndicatorsProps {
  compact?: boolean;
  traceback?: Traceback | undefined;
  showSyncStatus: boolean;
  css?: SystemStyleObject;
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
  showSyncStatus,
  css: cssProp,
}: SerialIndicatorsProps) => {
  const syncStatus = useSyncStatus();
  const syncMessage = syncMessages[syncStatus];
  const displaySyncMessage =
    showSyncStatus &&
    (!traceback || (traceback && syncStatus === SyncStatus.OUT_OF_SYNC));
  return (
    <HStack css={cssProp}>
      <Icon
        as={RiTerminalBoxLine}
        css={{ m: "1", fill: "white", width: "5", height: "5" }}
      />
      <HStack gap="0">
        {compact && traceback && syncStatus === SyncStatus.IN_SYNC && (
          <>
            <Icon
              as={RiErrorWarningLine}
              css={{ m: "1", fill: "white", width: "5", height: "5" }}
            />
            <Text color="white" whiteSpace="nowrap" data-testid="traceback">
              <MaybeTracebackLink traceback={traceback} />
            </Text>
          </>
        )}
        {displaySyncMessage && (
          <Text color="white" display="inline-flex" alignItems="center">
            <FormattedMessage id={syncMessage?.message} />
            {syncMessage?.icon && (
              <Icon
                as={syncMessage?.icon}
                css={{ ml: "1", fill: "white", width: "5", height: "5" }}
              />
            )}
          </Text>
        )}
      </HStack>
    </HStack>
  );
};

export default SerialIndicators;
