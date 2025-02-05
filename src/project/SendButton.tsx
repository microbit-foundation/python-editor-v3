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
import React, { FocusEvent, ForwardedRef, useCallback, useRef } from "react";
import { RiUsbLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { useConnectionStatus } from "../device/device-hooks";
import MoreMenuButton from "./MoreMenuButton";
import { useProjectActions } from "./project-hooks";
import { useHotkeys } from "react-hotkeys-hook";
import {
  globalShortcutConfig,
  keyboardShortcuts,
} from "../common/keyboard-shortcuts";
import { ConnectionAction, FinalFocusRef } from "./project-actions";

interface SendButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
  sendButtonRef: React.RefObject<HTMLButtonElement>;
}

const SendButton = React.forwardRef(
  (
    { size, sendButtonRef }: SendButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const status = useConnectionStatus();
    const connected = status === ConnectionStatus.CONNECTED;
    const actions = useProjectActions();
    const handleToggleConnected = useCallback(async () => {
      if (connected) {
        await actions.disconnect(menuButtonRef);
      } else {
        await actions.connect(false, ConnectionAction.CONNECT, menuButtonRef);
      }
    }, [connected, actions]);
    const intl = useIntl();
    const flashing = useRef<{ flashing: boolean; lastCompleteFlash: number }>({
      flashing: false,
      lastCompleteFlash: 0,
    });
    const handleSendToMicrobit = useCallback(
      async (finalFocusRef: FinalFocusRef) => {
        if (flashing.current.flashing) {
          // Ignore repeated clicks.
          return;
        }
        flashing.current = {
          flashing: true,
          lastCompleteFlash: flashing.current.lastCompleteFlash,
        };
        try {
          await actions.flash(finalFocusRef);
        } finally {
          flashing.current = {
            flashing: false,
            lastCompleteFlash: new Date().getTime(),
          };
        }
      },
      [flashing, actions]
    );
    const handleFocus = useCallback(
      (e: FocusEvent<unknown>) => {
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
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const activeElementRef = useRef<HTMLElement | null>(null);
    const handleSendToMicrobitShortcut = useCallback(() => {
      activeElementRef.current = document.activeElement as HTMLElement;
      handleSendToMicrobit(activeElementRef);
    }, [handleSendToMicrobit]);
    useHotkeys(
      keyboardShortcuts.sendToMicrobit,
      handleSendToMicrobitShortcut,
      globalShortcutConfig
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
                onClick={() => handleSendToMicrobit(sendButtonRef)}
              >
                <FormattedMessage id="send-action" />
              </Button>
            </Tooltip>
            <MoreMenuButton
              ref={menuButtonRef}
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
