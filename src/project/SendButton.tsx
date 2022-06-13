/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
  Tooltip,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import { MdMoreVert } from "react-icons/md";
import { RiUsbLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
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
      await actions.connect();
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
          <MenuButton
            variant="solid"
            aria-label={intl.formatMessage({ id: "more-connect-options" })}
            data-testid="more-connect-options"
            // Avoid animating part of the primary action change.
            borderLeft="1px"
            borderRadius="button"
            as={IconButton}
            icon={
              <MdMoreVert
                style={{
                  marginLeft: "calc(-0.15 * var(--chakra-radii-button))",
                }}
              />
            }
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
