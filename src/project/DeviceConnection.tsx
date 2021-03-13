import { HStack, Switch, Text, Tooltip } from "@chakra-ui/react";
import { useCallback } from "react";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import DownloadButton from "./DownloadButton";
import FlashButton from "./FlashButton";
import { useProjectActions } from "./project-hooks";

/**
 * The device connection area.
 *
 * It shows the current connection status and allows the user to
 * flash (if WebUSB is supported) or otherwise just download a HEX.
 */
const DeviceConnection = () => {
  const connectionStatus = useConnectionStatus();
  const connected = connectionStatus === ConnectionStatus.CONNECTED;
  const actions = useProjectActions();
  const handleToggleConnected = useCallback(async () => {
    if (connected) {
      await actions.disconnect()
    } else {
      await actions.connect();
    }
  }, [connected, actions]);
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

export default DeviceConnection;
