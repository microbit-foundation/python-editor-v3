import {
  Button,
  HStack,
  Switch,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { RiFlashlightFill } from "react-icons/ri";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import { ConnectionMode, ConnectionStatus } from "../device";
import { useFileSystem } from "../fs/fs-hooks";

const DeviceConnection = () => {
  const connectionStatus = useConnectionStatus();
  const connected = connectionStatus === ConnectionStatus.CONNECTED;
  const [progress, setProgress] = useState<undefined | number>(undefined);
  const toast = useToast();
  const device = useDevice();
  const fs = useFileSystem();
  const handleToggleConnected = useCallback(async () => {
    if (connected) {
      device.disconnect();
    } else {
      try {
        await device.connect(ConnectionMode.INTERACTIVE);
      } catch (e) {
        toast({
          title: "Failed to connect to the micro:bit",
          status: "error",
          description: e.message,
          position: "top",
          isClosable: true,
        });
      }
    }
  }, [device, connected]);

  const handleFlash = useCallback(async () => {
    // TODO: need to know board id to get best hex.
    // TODO: review error reporting vs v2.
    let hex: string | undefined;
    try {
      hex = await fs!.toHexForDownload();
    } catch (e) {
      toast({
        title: "Failed to build the hex file",
        status: "error",
        description: e.message,
        position: "top",
        isClosable: true,
      });
      return;
    }

    try {
      // TODO: partial flashing!
      device.flash(hex, setProgress);
    } catch (e) {
      toast({
        title: "Failed to flash the micro:bit",
        status: "error",
        description: e.message,
        position: "top",
        isClosable: true,
      });
    }
  }, [fs, device]);

  return (
    <VStack
      background="rgb(47, 196, 47, 0.2)"
      padding={5}
      spacing={2}
      align="flex-start"
    >
      <HStack as="label" spacing={3}>
        <Switch
          size="lg"
          isChecked={connected}
          onChange={handleToggleConnected}
        />
        <Text as="span" size="lg" fontWeight="semibold">
          {connected ? "micro:bit connected" : "micro:bit disconnected"}
        </Text>
      </HStack>
      <Button
        leftIcon={<RiFlashlightFill />}
        size="lg"
        width="100%"
        disabled={!fs || !connected || typeof progress !== "undefined"}
        onClick={handleFlash}
      >
        {typeof progress === "undefined"
          ? "Flash micro:bit"
          : `Flashing… (${(progress * 100).toFixed(0)}%)`}
      </Button>
    </VStack>
  );
};

export default DeviceConnection;
