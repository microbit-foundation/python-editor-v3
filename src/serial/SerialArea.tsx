/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex } from "@chakra-ui/react";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
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
      {!connected ? null : <XTerm flex="1 1 auto" height={0} />}
    </Flex>
  );
};

export default SerialArea;
