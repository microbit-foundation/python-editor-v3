/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonGroup, MenuItem, MenuList, MenuTrigger } from "@microbit/ui";
import { RiDownload2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
import SaveButton from "./SaveButton";
import MoreMenuButton from "./MoreMenuButton";
import { useProjectActions } from "./project-hooks";
import { useRef } from "react";

interface SaveMenuButtonProps {
  size?: "lg" | "md" | "sm" | "xs";
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
      <ButtonGroup isAttached>
        <SaveButton
          mode="button"
          size={size}
          css={{ borderRight: "1px solid" }}
        />
        <MenuTrigger>
          <MoreMenuButton
            ref={menuButtonRef}
            aria-label={intl.formatMessage({ id: "more-save-options" })}
            size={size}
            data-testid="more-save-options"
          />
          <MenuList>
            <MenuItem
              icon={<RiDownload2Line />}
              onAction={() => actions.saveMainFile(menuButtonRef)}
            >
              <FormattedMessage id="save-python-action" />
            </MenuItem>
          </MenuList>
        </MenuTrigger>
      </ButtonGroup>
    </HStack>
  );
};

export default SaveMenuButton;
