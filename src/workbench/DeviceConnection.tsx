import { HStack, Switch, Text } from "@chakra-ui/react";
import React, { useCallback } from "react";
import Separate from "../common/Separate";
import useActionFeedback, {
  ActionFeedback,
} from "../common/use-action-feedback";
import { ConnectionMode, ConnectionStatus, WebUSBError } from "../device";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";
import DownloadButton from "./DownloadButton";
import FlashButton from "./FlashButton";

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
  const buttonWidth = "10rem";
  return (
    <HStack>
      {supported ? (
        <HStack as="label" spacing={3} width="14rem">
          <Switch isChecked={connected} onChange={handleToggleConnected} />
          <Text as="span" size="lg" fontWeight="semibold">
            {connected ? "micro:bit connected" : "micro:bit disconnected"}
          </Text>
        </HStack>
      ) : null}
      <HStack>
        {supported && (
          <FlashButton
            mode={connected ? "button" : "icon"}
            buttonWidth={buttonWidth}
          />
        )}
        <DownloadButton
          mode={connected ? "icon" : "button"}
          buttonWidth={buttonWidth}
        />
      </HStack>
    </HStack>
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
