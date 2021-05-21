import React, { useCallback } from "react";
import { Button, Tooltip } from "@chakra-ui/react";
import { RiUsbLine } from "react-icons/ri";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import { useProjectActions } from "./project-hooks";

const ConnectDisconnectButton = () => {
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  const actions = useProjectActions();
  const handleToggleConnected = useCallback(async () => {
    if (connected) {
      await actions.disconnect();
    } else {
      await actions.connect();
    }
  }, [connected, actions]);

  const tooltip = connected
    ? "Disconnect from the micro:bit"
    : "Connect to your micro:bit over WebUSB";
  return (
    <Tooltip hasArrow placement="top-start" label={tooltip}>
      <Button
        size="lg"
        leftIcon={<RiUsbLine />}
        onClick={handleToggleConnected}
        variant="outline"
        colorScheme="blimpPurple"
      >
        {connected ? "Disconnect" : "Connect"}
      </Button>
    </Tooltip>
  );
};

export default ConnectDisconnectButton;
