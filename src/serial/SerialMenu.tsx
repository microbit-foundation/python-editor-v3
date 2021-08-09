import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import { MdMoreVert } from "react-icons/md";
import { RiInformationLine, RiKeyboardBoxLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import { useSerialActions } from "./serial-hooks";

interface SerialMenuProps {
  compact?: boolean;
  onSizeChange: (size: "compact" | "open") => void;
  onOpenHelp: () => void;
}

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
            Send Ctrl-C for REPL
          </MenuItem>
          <MenuItem icon={<RiKeyboardBoxLine />} onClick={actions.reset}>
            Send Ctrl-D to reset
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<RiInformationLine />} onClick={onOpenHelp}>
            Hints and tips
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default SerialMenu;
