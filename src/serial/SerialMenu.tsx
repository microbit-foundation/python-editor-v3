/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import React, { ForwardedRef } from "react";
import { MdMoreVert } from "react-icons/md";
import { RiInformationLine, RiKeyboardBoxLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import { useSerialActions } from "./serial-hooks";

interface SerialMenuProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
  onShowHintsAndTips?: () => void;
}

/**
 * Serial ara drop-down menu.
 */
const SerialMenu = React.forwardRef(
  (
    { compact, onSizeChange, onShowHintsAndTips }: SerialMenuProps,
    menuButtonRef: ForwardedRef<HTMLButtonElement>
  ) => {
    const intl = useIntl();
    const actions = useSerialActions(onSizeChange);
    return (
      <Menu placement={compact ? "top-start" : undefined}>
        <MenuButton
          ref={menuButtonRef}
          as={IconButton}
          aria-label={intl.formatMessage({ id: "serial-menu" })}
          variant="sidebar"
          color="white"
          isRound
          icon={<MdMoreVert />}
        />
        <Portal>
          <MenuList zIndex={zIndexAboveTerminal}>
            <MenuItem icon={<RiKeyboardBoxLine />} onClick={actions.interrupt}>
              <FormattedMessage id="serial-ctrl-c-action" />
            </MenuItem>
            <MenuItem icon={<RiKeyboardBoxLine />} onClick={actions.reset}>
              <FormattedMessage id="serial-ctrl-d-action" />
            </MenuItem>
            {onShowHintsAndTips && (
              <>
                <MenuDivider />
                <MenuItem
                  icon={<RiInformationLine />}
                  onClick={onShowHintsAndTips}
                >
                  <FormattedMessage id="serial-hints-and-tips" />
                </MenuItem>
              </>
            )}
          </MenuList>
        </Portal>
      </Menu>
    );
  }
);

export default SerialMenu;
