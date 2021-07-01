/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ConnectionStatus, EVENT_SERIAL_DATA } from "../device/device";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
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
      {!connected ? null : (
        <>
          <XTerm flex="1 1 auto" height={0} />
          <XTermOverlay />
        </>
      )}
    </Flex>
  );
};

const XTermOverlay = (props: BoxProps) => {
  const device = useDevice();
  const [hidden, setHidden] = useState<boolean>(false);
  useEffect(() => {
    const listener = () => {
      setHidden(true);
    };
    device.once(EVENT_SERIAL_DATA, listener);
    return () => {
      device.removeListener(EVENT_SERIAL_DATA, listener);
    };
  });
  return (
    <VStack
      display={hidden ? "none" : "flex"}
      color="white"
      position="absolute"
      top="0"
      left="0"
      right="100%"
      width="100%"
      bottom="100%"
      zIndex={1}
      textColor="gray.100"
      pt={8}
      pb={8}
      pl={5}
      pr={5}
      spacing={4}
      alignItems="stretch"
    >
      <Text fontSize="lg">
        Text from your micro:bit sent over WebUSB will be shown here.
      </Text>
      <Text fontSize="lg" maxWidth="76ch">
        You can press Ctrl-C to interrupt the micro:bit program then type Python
        commands directly to your micro:bit.
      </Text>
    </VStack>
  );
};

export default SerialArea;
