import { HStack, Switch, Text, Tooltip } from "@chakra-ui/react";
import React, { useCallback } from "react";
import Separate from "../common/Separate";
import useActionFeedback, {
  ActionFeedback,
} from "../common/use-action-feedback";
import { ConnectionStatus, WebUSBError } from "../device/device";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import DownloadButton from "./DownloadButton";
import FlashButton from "./FlashButton";

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
  const handleToggleConnected = useCallback(async () => {
    if (connected) {
      await device.disconnect();
    } else {
      if (!supported) {
        actionFeedback.expectedError({
          title: "WebUSB not supported",
          description: "Download the hex file or try Chrome or Microsoft Edge",
        });
      } else {
        try {
          await device.connect();
        } catch (e) {
          handleWebUSBError(actionFeedback, e);
        }
      }
    }
  }, [device, connected, actionFeedback, supported]);
  const buttonWidth = "10rem";
  return (
    <HStack>
      <HStack>
        <DownloadButton
          mode={connected ? "icon" : "button"}
          buttonWidth={buttonWidth}
          size="lg"
        />
        <FlashButton
          mode={connected ? "button" : "icon"}
          buttonWidth={buttonWidth}
          size="lg"
        />
      </HStack>
      <HStack as="label" spacing={3} width="14rem">
        <Tooltip text="Connect to your micro:bit over WebUSB">
          <Switch isChecked={connected} onChange={handleToggleConnected} />
        </Tooltip>
        <Text as="span" size="lg" fontWeight="semibold">
          {connected ? "micro:bit connected" : "micro:bit disconnected"}
        </Text>
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
