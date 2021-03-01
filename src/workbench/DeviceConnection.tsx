import { Button, HStack, Switch, Text, VStack } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { RiFlashlightFill } from "react-icons/ri";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import { ConnectionMode, ConnectionStatus } from "../device";
import { useFileSystem } from "../fs/fs-hooks";
import DownloadButton from "./DownloadButton";
import useActionFeedback from "../common/use-action-feedback";

const DeviceConnection = () => {
  const connectionStatus = useConnectionStatus();
  const connected = connectionStatus === ConnectionStatus.CONNECTED;
  const supported = connectionStatus !== ConnectionStatus.NOT_SUPPORTED;
  const [progress, setProgress] = useState<undefined | number>(undefined);
  const actionFeedback = useActionFeedback();
  const device = useDevice();
  const fs = useFileSystem();
  const handleToggleConnected = useCallback(async () => {
    if (connected) {
      device.disconnect();
    } else {
      try {
        await device.connect(ConnectionMode.INTERACTIVE);
      } catch (e) {
        actionFeedback.expectedError({
          title: "Failed to connect to the micro:bit",
          description: e.message,
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
      actionFeedback.expectedError({
        title: "Failed to build the hex file",
        description: e.message,
      });
      return;
    }

    try {
      // TODO: partial flashing!
      device.flash(hex, setProgress);
    } catch (e) {
      actionFeedback.expectedError({
        title: "Failed to flash the micro:bit",
        description: e.message,
      });
    }
  }, [fs, device]);

  return (
    <VStack
      backgroundColor="var(--sidebar)"
      padding={5}
      spacing={2}
      align="flex-start"
    >
      {supported ? (
        <>
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
        </>
      ) : (
        <DownloadButton size="lg" width="100%" />
      )}
    </VStack>
  );
};

export default DeviceConnection;
