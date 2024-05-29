/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@chakra-ui/button";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  ThemeTypings,
  ThemingProps,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { IoMdGlobe } from "react-icons/io";
import { RiListSettingsLine, RiSettings2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useDialogs } from "../common/use-dialogs";
import { zIndexAboveTerminal } from "../common/zIndex";
import { flags } from "../flags";
import { LanguageDialog } from "./LanguageDialog";
import { SettingsDialog } from "./SettingsDialog";

interface SettingsMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * The settings button triggers a menu with main and other settings.
 */
const SettingsMenu = ({ size, ...props }: SettingsMenuProps) => {
  const languageDisclosure = useDisclosure();
  const intl = useIntl();
  const dialogs = useDialogs();
  const handleShowSettings = useCallback(() => {
    dialogs.show((callback) => (
      <SettingsDialog
        isOpen
        onClose={() => callback(undefined)}
        finalFocusRef={menuButtonRef}
      />
    ));
  }, [dialogs]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <LanguageDialog
        isOpen={languageDisclosure.isOpen}
        onClose={languageDisclosure.onClose}
        finalFocusRef={menuButtonRef}
      />
      <Menu {...props}>
        <MenuButton
          ref={menuButtonRef}
          as={IconButton}
          data-testid="settings"
          aria-label={intl.formatMessage({ id: "settings" })}
          size={size}
          fontSize="xl"
          variant="sidebar"
          icon={<RiSettings2Line />}
          color="white"
          isRound
        />
        <Portal>
          <MenuList zIndex={zIndexAboveTerminal}>
            {!flags.noLang && (
              <MenuItem
                icon={<IoMdGlobe />}
                onClick={languageDisclosure.onOpen}
                data-testid="language"
              >
                <FormattedMessage id="language" />
              </MenuItem>
            )}
            <MenuItem
              icon={<RiListSettingsLine />}
              onClick={handleShowSettings}
            >
              <FormattedMessage id="settings" />
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default SettingsMenu;
