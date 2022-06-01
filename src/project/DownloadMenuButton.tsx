/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ButtonGroup,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
} from "@chakra-ui/react";
import { MdMoreVert } from "react-icons/md";
import { RiDownload2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexAboveTerminal } from "../common/zIndex";
import DownloadButton from "./DownloadButton";
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
  const buttonWidth = "10rem"; // 8.1 with md buttons
  return (
    <HStack>
      <Menu>
        <ButtonGroup isAttached>
          <DownloadButton
            width={buttonWidth}
            mode={"button"}
            size={size}
            borderRight="1px"
          />
          <MenuButton
            aria-label={intl.formatMessage({ id: "more-download-options" })}
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
