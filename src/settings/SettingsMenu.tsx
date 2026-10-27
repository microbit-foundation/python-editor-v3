/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  MenuItem,
  MenuList,
  MenuTrigger,
  SystemStyleObject,
} from "@microbit/ui";
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
  /**
   * The trigger's button variant. The default suits the editor's black
   * chrome; the pages pass "plain" for the brand-coloured header, where the
   * family shows no hover state on icon buttons.
   */
  variant?: "sidebar" | "plain";
  /** Per-instance overrides for the trigger button, merged last. */
  css?: SystemStyleObject;
}

/**
 * The settings button triggers a menu with main and other settings.
 */
const SettingsMenu = ({
  size,
  variant = "sidebar",
  css: cssProp,
}: SettingsMenuProps) => {
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
          css={{ fontSize: "xl", ...cssProp }}
          variant={variant}
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
