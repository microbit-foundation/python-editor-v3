/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ButtonGroup,
  HStack,
  Menu,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
} from "@chakra-ui/react";
import { RiDownload2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import SaveButton from "./SaveButton";
import MoreMenuButton from "./MoreMenuButton";
import { useProjectActions } from "./project-hooks";
import { useRef } from "react";

interface SaveMenuButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * The device connection area.
 *
 * It shows the current connection status and allows the user to
 * flash (if WebUSB is supported) or otherwise just save a HEX.
 */
const SaveMenuButton = ({ size }: SaveMenuButtonProps) => {
  const intl = useIntl();
  const actions = useProjectActions();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <HStack>
      <Menu>
        <ButtonGroup isAttached>
          <SaveButton mode="button" size={size} borderRight="1px" />
          <MoreMenuButton
            ref={menuButtonRef}
            aria-label={intl.formatMessage({ id: "more-save-options" })}
            size={size}
            data-testid="more-save-options"
          />
          <Portal>
            <MenuList zIndex={zIndexAboveTerminal}>
              <MenuItem
                icon={<RiDownload2Line />}
                onClick={() => actions.saveMainFile(menuButtonRef)}
              >
                <FormattedMessage id="save-python-action" />
              </MenuItem>
            </MenuList>
          </Portal>
        </ButtonGroup>
      </Menu>
    </HStack>
  );
};

export default SaveMenuButton;
