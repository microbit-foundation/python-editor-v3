/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, Icon, Text } from "@chakra-ui/react";
import { RiErrorWarningLine, RiTerminalBoxLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { Traceback } from "../device/device-hooks";
import MaybeTracebackLink from "./MaybeTracebackLink";

interface SerialIndicatorsProps extends BoxProps {
  compact?: boolean;
  traceback?: Traceback | undefined;
}

/**
 * Icon and traceback status.
 */
const SerialIndicators = ({
  compact,
  traceback,
  ...props
}: SerialIndicatorsProps) => {
  return (
    <HStack {...props}>
      <Icon m={1} as={RiTerminalBoxLine} fill="white" boxSize={5} />
      <HStack spacing={0}>
        {compact && traceback && (
          <>
            <Icon m={1} as={RiErrorWarningLine} fill="white" boxSize={5} />
            <Text color="white" whiteSpace="nowrap">
              <MaybeTracebackLink traceback={traceback} /> {traceback.error}
            </Text>
          </>
        )}
        {!traceback && (
          <Text color="white">
            <FormattedMessage id="serial-running" />
          </Text>
        )}
      </HStack>
    </HStack>
  );
};

export default SerialIndicators;
