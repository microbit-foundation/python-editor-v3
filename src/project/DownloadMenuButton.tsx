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
import DownloadButton from "./DownloadButton";
import MoreMenuButton from "./MoreMenuButton";
import { useProjectActions } from "./project-hooks";

interface DownloadMenuButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * The device connection area.
 *
 * It shows the current connection status and allows the user to
 * flash (if WebUSB is supported) or otherwise just download a HEX.
 */
const DownloadMenuButton = ({ size }: DownloadMenuButtonProps) => {
  const intl = useIntl();
  const actions = useProjectActions();
  return (
    <HStack>
      <Menu>
        <ButtonGroup isAttached>
          <DownloadButton mode="button" size={size} borderRight="1px" />
          <MoreMenuButton
            aria-label={intl.formatMessage({ id: "more-download-options" })}
            size={size}
          />
          <Portal>
            <MenuList zIndex={zIndexAboveTerminal}>
              <MenuItem
                icon={<RiDownload2Line />}
                onClick={actions.downloadMainFile}
              >
                <FormattedMessage id="download-python-action" />
              </MenuItem>
            </MenuList>
          </Portal>
        </ButtonGroup>
      </Menu>
    </HStack>
  );
};

export default DownloadMenuButton;
