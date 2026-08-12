/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuTrigger,
} from "@microbit/ui";
import React, { ForwardedRef } from "react";
import { MdMoreVert } from "react-icons/md";
import { RiInformationLine, RiKeyboardBoxLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
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
      <MenuTrigger>
        <IconButton
          ref={menuButtonRef}
          aria-label={intl.formatMessage({ id: "serial-menu" })}
          variant="sidebar"
          isRound
        >
          <MdMoreVert />
        </IconButton>
        <MenuList placement={compact ? "top start" : undefined}>
          <MenuItem icon={<RiKeyboardBoxLine />} onAction={actions.interrupt}>
            <FormattedMessage id="serial-ctrl-c-action" />
          </MenuItem>
          <MenuItem icon={<RiKeyboardBoxLine />} onAction={actions.reset}>
            <FormattedMessage id="serial-ctrl-d-action" />
          </MenuItem>
          {onShowHintsAndTips && (
            <>
              <MenuDivider />
              <MenuItem
                icon={<RiInformationLine />}
                onAction={onShowHintsAndTips}
              >
                <FormattedMessage id="serial-hints-and-tips" />
              </MenuItem>
            </>
          )}
        </MenuList>
      </MenuTrigger>
    );
  }
);

export default SerialMenu;
