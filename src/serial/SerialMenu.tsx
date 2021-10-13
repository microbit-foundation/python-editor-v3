/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import { MdMoreVert } from "react-icons/md";
import { RiKeyboardBoxLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import { useSerialActions } from "./serial-hooks";

interface SerialMenuProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
  onOpenHelp: () => void;
}

/**
 * Serial ara drop-down menu.
 */
const SerialMenu = ({ compact, onOpenHelp, onSizeChange }: SerialMenuProps) => {
  const intl = useIntl();
  const actions = useSerialActions(onSizeChange);
  return (
    <Menu placement={compact ? "top-start" : undefined}>
      <MenuButton
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
            <FormattedMessage id="serial-ctrl-c-button" />
          </MenuItem>
          <MenuItem icon={<RiKeyboardBoxLine />} onClick={actions.reset}>
            <FormattedMessage id="serial-ctrl-d-button" />
          </MenuItem>
          <MenuItem icon={<RiKeyboardBoxLine />} onClick={actions.pasteMode}>
            <FormattedMessage id="serial-ctrl-e-button" />
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default SerialMenu;
