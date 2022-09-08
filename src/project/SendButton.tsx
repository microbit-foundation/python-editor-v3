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
import React, { ForwardedRef, useCallback, useRef } from "react";
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

const SendButton = React.forwardRef(
  ({ size }: SendButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
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
    const flashing = useRef<{ flashing: boolean; lastCompleteFlash: number }>({
      flashing: false,
      lastCompleteFlash: 0,
    });
    const handleSendToMicrobit = useCallback(async () => {
      if (flashing.current.flashing) {
        // Ignore repeated clicks.
        return;
      }
      flashing.current = {
        flashing: true,
        lastCompleteFlash: flashing.current.lastCompleteFlash,
      };
      try {
        await actions.flash();
      } finally {
        flashing.current = {
          flashing: false,
          lastCompleteFlash: new Date().getTime(),
        };
      }
    }, [flashing, actions]);
    const handleFocus = useCallback(
      (e) => {
        const inProgress = flashing.current.flashing;
        const delta = new Date().getTime() - flashing.current.lastCompleteFlash;
        if (inProgress || delta < 200) {
          // Avoid the tooltip obscuring the "micro:bit flashed" text just above the button.
          // This does not prevent focus, just the Tooltip's handler running.
          e.preventDefault();
        }
      },
      [flashing]
    );
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
                ref={ref}
                onFocus={handleFocus}
                size={size}
                variant="solid"
                leftIcon={<RiUsbLine />}
                onClick={handleSendToMicrobit}
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
  }
);

export default SendButton;
