/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton, MenuItem, MenuList, MenuTrigger } from "@microbit/ui";
import { useCallback, useRef, useState } from "react";
import { IoMdGlobe } from "react-icons/io";
import { RiListSettingsLine, RiSettings2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { useDialogs } from "../common/use-dialogs";
import { flags } from "../flags";
import { LanguageDialog } from "./LanguageDialog";
import { SettingsDialog } from "./SettingsDialog";

interface SettingsMenuProps {
  size?: "lg" | "md" | "sm" | "xs";
}

/**
 * The settings button triggers a menu with main and other settings.
 */
const SettingsMenu = ({ size }: SettingsMenuProps) => {
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
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
        isOpen={languageDialogOpen}
        onClose={() => setLanguageDialogOpen(false)}
        finalFocusRef={menuButtonRef}
      />
      <MenuTrigger>
        <IconButton
          ref={menuButtonRef}
          data-testid="settings"
          aria-label={intl.formatMessage({ id: "settings" })}
          size={size}
          css={{ fontSize: "xl" }}
          variant="sidebar"
        >
          <RiSettings2Line />
        </IconButton>
        <MenuList>
          {!flags.noLang && (
            <MenuItem
              icon={<IoMdGlobe />}
              onAction={() => setLanguageDialogOpen(true)}
              data-testid="language"
            >
              <FormattedMessage id="language" />
            </MenuItem>
          )}
          <MenuItem icon={<RiListSettingsLine />} onAction={handleShowSettings}>
            <FormattedMessage id="settings" />
          </MenuItem>
        </MenuList>
      </MenuTrigger>
    </>
  );
};

export default SettingsMenu;
