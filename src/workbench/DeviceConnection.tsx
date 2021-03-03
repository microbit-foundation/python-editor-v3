import { Button, HStack, Switch, Text, VStack } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { RiFlashlightFill } from "react-icons/ri";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import { ConnectionMode, ConnectionStatus, WebUSBError } from "../device";
import { useFileSystem } from "../fs/fs-hooks";
import DownloadButton from "./DownloadButton";
import useActionFeedback, {
  ActionFeedback,
} from "../common/use-action-feedback";
import { BoardId } from "../device/board-id";
import Separate from "../common/Separate";

class HexGenerationError extends Error {}

/**
 * The device connection area.
 *
 * It shows the current connection status and allows the user to
 * flash (if WebUSB is supported) or otherwise just download a HEX.
 */
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
      await device.disconnect();
    } else {
      try {
        await device.connect(ConnectionMode.INTERACTIVE);
      } catch (e) {
        handleWebUSBError(actionFeedback, e);
      }
    }
  }, [device, connected]);

  const handleFlash = useCallback(async () => {
    const dataSource = async (boardId: BoardId) => {
      try {
        return await fs.toHexForFlash(boardId);
      } catch (e) {
        throw new HexGenerationError(e.message);
      }
    };

    try {
      await device.flash(dataSource, { partial: true, progress: setProgress });
    } catch (e) {
      if (e instanceof HexGenerationError) {
        actionFeedback.expectedError({
          title: "Failed to build the hex file",
          description: e.message,
        });
      } else {
        handleWebUSBError(actionFeedback, e);
      }
    }
  }, [fs, device, actionFeedback]);

  return (
    <VStack
      backgroundColor="var(--sidebar)"
      padding={5}
      spacing={2}
      align="flex-start"
    >
      {supported ? (
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
      ) : null}

      <HStack justifyContent="space-between" width="100%">
        {connected && (
          <Button
            leftIcon={<RiFlashlightFill />}
            size="lg"
            width="100%"
            disabled={!fs || !connected || typeof progress !== "undefined"}
            onClick={handleFlash}
          >
            {typeof progress === "undefined"
              ? "Flash"
              : `Flashing… (${(progress * 100).toFixed(0)}%)`}
          </Button>
        )}
        <DownloadButton size="lg" width="100%" />
      </HStack>
    </VStack>
  );
};

const handleWebUSBError = (actionFeedback: ActionFeedback, e: any) => {
  if (e instanceof WebUSBError) {
    actionFeedback.expectedError({
      title: e.title,
      description: (
        <Separate separator={(k) => <br key={k} />}>
          {[e.message, e.description].filter(Boolean)}
        </Separate>
      ),
    });
  } else {
    actionFeedback.unexpectedError(e);
  }
};

export default DeviceConnection;
