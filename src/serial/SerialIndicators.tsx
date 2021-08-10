/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, HStack, Icon, Text } from "@chakra-ui/react";
import { RiErrorWarningLine, RiTerminalBoxLine } from "react-icons/ri";
import { useDeviceTraceback } from "../device/device-hooks";
import MaybeTracebackLink from "./MaybeTracebackLink";

interface SerialIndicatorsProps extends BoxProps {
  compact?: boolean;
}

const SerialIndicators = ({ compact, ...props }: SerialIndicatorsProps) => {
  const traceback = useDeviceTraceback();
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
        {!traceback && <Text color="white">Running…</Text>}
      </HStack>
    </HStack>
  );
};

export default SerialIndicators;
