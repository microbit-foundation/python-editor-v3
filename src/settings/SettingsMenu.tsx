/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
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
import { IoMdGlobe } from "react-icons/io";
import { RiListSettingsLine, RiSettings2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { LanguageDialog } from "./LanguageDialog";
import { SettingsDialog } from "./SettingsDialog";

interface SettingsMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * The settings button triggers a menu with main and other settings.
 */
const SettingsMenu = ({ size, ...props }: SettingsMenuProps) => {
  const settingsDisclosure = useDisclosure();
  const languageDisclosure = useDisclosure();
  const intl = useIntl();
  return (
    <>
      <SettingsDialog
        isOpen={settingsDisclosure.isOpen}
        onClose={settingsDisclosure.onClose}
      />
      <LanguageDialog
        isOpen={languageDisclosure.isOpen}
        onClose={languageDisclosure.onClose}
      />
      <Menu {...props}>
        <MenuButton
          as={IconButton}
          data-testid="settings"
          aria-label={intl.formatMessage({ id: "settings" })}
          size={size}
          fontSize="xl"
          variant="sidebar"
          icon={<RiSettings2Line />}
          colorScheme="gray"
          isRound
        />
        <Portal>
          <MenuList>
            <MenuItem
              icon={<IoMdGlobe />}
              onClick={languageDisclosure.onOpen}
              data-testid="language"
            >
              <FormattedMessage id="language" />
            </MenuItem>
            <MenuItem
              icon={<RiListSettingsLine />}
              onClick={settingsDisclosure.onOpen}
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
