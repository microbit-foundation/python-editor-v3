/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  ButtonGroup,
  HStack,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
  Tooltip,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiUsbLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import { ConnectionAction, ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import MoreMenuButton from "./MoreMenuButton";
import { useProjectActions } from "./project-hooks";

interface SendButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

const SendButton = ({ size }: SendButtonProps) => {
  const status = useConnectionStatus();
  const connected = status === ConnectionStatus.CONNECTED;
  const actions = useProjectActions();
  const handleToggleConnected = useCallback(async () => {
    if (connected) {
      await actions.disconnect();
    } else {
      await actions.connect(false, ConnectionAction.CONNECT);
    }
  }, [connected, actions]);
  const intl = useIntl();

  return (
    <HStack>
      <Menu>
        <ButtonGroup isAttached>
          <Tooltip
            hasArrow
            placement="top-start"
            label={intl.formatMessage({
              id: "send-hover",
            })}
          >
            <Button
              size="lg"
              variant="solid"
              leftIcon={<RiUsbLine />}
              onClick={actions.flash}
            >
              <FormattedMessage id="send-action" />
            </Button>
          </Tooltip>
          <MoreMenuButton
            variant="solid"
            aria-label={intl.formatMessage({ id: "more-connect-options" })}
            data-testid="more-connect-options"
            size={size}
          />
          <Portal>
            <MenuList zIndex={zIndexAboveTerminal}>
              <MenuItem icon={<RiUsbLine />} onClick={handleToggleConnected}>
                <FormattedMessage
                  id={connected ? "disconnect-action" : "connect-action"}
                />
              </MenuItem>
            </MenuList>
          </Portal>
        </ButtonGroup>
      </Menu>
    </HStack>
  );
};

export default SendButton;
