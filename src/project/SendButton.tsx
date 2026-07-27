/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  ButtonGroup,
  MenuItem,
  MenuList,
  MenuTrigger,
  Tooltip,
} from "@microbit/ui";
import React, { ForwardedRef, useCallback, useRef } from "react";
import { RiUsbLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
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
  size?: "lg" | "md" | "sm" | "xs";
  sendButtonRef: React.RefObject<HTMLButtonElement>;
}

const SendButton = React.forwardRef(
  (
    { size, sendButtonRef }: SendButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const status = useConnectionStatus();
    const connected = status === ConnectionStatus.Connected;
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
    // The Chakra version prevented the tooltip's focus handler after a flash
    // so it didn't obscure the "micro:bit flashed" text. RAC tooltips only
    // show on keyboard focus-visible (not programmatic/pointer focus), so no
    // equivalent hack is needed.
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
        <ButtonGroup isAttached>
          <Tooltip
            hasArrow
            placement="top start"
            label={intl.formatMessage({
              id: "send-hover",
            })}
          >
            <Button
              ref={ref}
              size={size}
              variant="primary"
              leftIcon={<RiUsbLine />}
              onPress={() => handleSendToMicrobit(sendButtonRef)}
            >
              <FormattedMessage id="send-action" />
            </Button>
          </Tooltip>
          <MenuTrigger>
            <MoreMenuButton
              ref={menuButtonRef}
              variant="primary"
              aria-label={intl.formatMessage({ id: "more-connect-options" })}
              data-testid="more-connect-options"
              size={size}
            />
            <MenuList>
              <MenuItem icon={<RiUsbLine />} onAction={handleToggleConnected}>
                <FormattedMessage
                  id={connected ? "disconnect-action" : "connect-action"}
                />
              </MenuItem>
            </MenuList>
          </MenuTrigger>
        </ButtonGroup>
      </HStack>
    );
  }
);

export default SendButton;
