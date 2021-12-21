/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useCallback } from "react";
import { Button, Tooltip } from "@chakra-ui/react";
import { RiUsbLine } from "react-icons/ri";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import { useProjectActions } from "./project-hooks";
import { FormattedMessage, useIntl } from "react-intl";

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

  const intl = useIntl();
  const tooltip = intl.formatMessage({
    id: connected ? "disconnect-hover" : "connect-hover",
  });
  return (
    <Tooltip hasArrow placement="top-start" label={tooltip}>
      <Button
        size="lg"
        leftIcon={<RiUsbLine />}
        onClick={handleToggleConnected}
      >
        <FormattedMessage
          id={connected ? "disconnect-action" : "connect-action"}
        />
      </Button>
    </Tooltip>
  );
};

export default ConnectDisconnectButton;
