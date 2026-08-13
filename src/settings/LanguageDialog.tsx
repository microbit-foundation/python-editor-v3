/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  LanguageDialog as SharedLanguageDialog,
  LanguageDialogLanguage,
} from "@microbit/ui-patterns";
import { RefObject, useCallback, useMemo } from "react";
import { deployment } from "../deployment";
import { supportedLanguages, useSettings } from "./settings";

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef: RefObject<HTMLButtonElement>;
}

/**
 * Language setting dialog: @microbit/ui-patterns' LanguageDialog fed our
 * supported languages (all fully supported; preview markers for in-progress
 * translations).
 */
export const LanguageDialog = ({
  isOpen,
  onClose,
  finalFocusRef,
}: LanguageDialogProps) => {
  const [settings, setSettings] = useSettings();
  const languages = useMemo<LanguageDialogLanguage[]>(
    () =>
      supportedLanguages.map((language) => ({
        id: language.id,
        preview: language.preview,
      })),
    []
  );
  const handleSelectLanguage = useCallback(
    (languageId: string) => {
      setSettings({ ...settings, languageId });
    },
    [settings, setSettings]
  );
  return (
    <SharedLanguageDialog
      isOpen={isOpen}
      onClose={onClose}
      finalFocusRef={finalFocusRef}
      languages={languages}
      onSelectLanguage={handleSelectLanguage}
      translationLinkHref={deployment.translationLink}
    />
  );
};
