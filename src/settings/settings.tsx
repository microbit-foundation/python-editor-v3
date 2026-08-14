/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  getDefaultLanguageId,
  type KnownLanguageId,
} from "@microbit/ui-patterns";
import { createContext, ReactNode, useContext } from "react";
import { useStorage } from "../common/use-storage";
import { defaultCodeFontSizePt } from "../deployment/misc";
import { stage } from "../environment";
import { flags } from "../flags";

/**
 * Names and display order come from @microbit/ui-patterns' language
 * registry; this list holds only what the registry can't know.
 */
export interface Language {
  // The shared registry's id union, so `tsc` catches an id the family
  // doesn't know. Canonical BCP 47 casing (also our Crowdin codes); lowercase
  // ids from stored settings and ?l= links are still accepted on read.
  id: KnownLanguageId;
  // An early preview of an in-progress translation, enabled on beta only.
  preview?: boolean;
}

// We precache files for this locale, so it is a safe fallback
// if a user changes language while offline.
export const fallbackLocale = "en";

// When we add languages we need to update the toolkit search indexing,
// which will require the dynamic import of a new language plugin for lunr.
// See search.ts.
//
// Tag new languages with `preview: true` to enable for beta only.
const allLanguages: Language[] = [
  { id: "en" },
  { id: "ca" },
  { id: "zh-CN" },
  { id: "zh-TW" },
  { id: "nl" },
  { id: "fr" },
  { id: "de", preview: true },
  { id: "ga-IE", preview: true },
  { id: "ja" },
  { id: "ko" },
  { id: "pl" },
  { id: "es-ES" },
];
export const supportedLanguages: Language[] = allLanguages.filter(
  (l) => stage !== "PRODUCTION" || !l.preview
);

export const minimumFontSize = 4;
export const maximumFontSize = 154;
export const fontSizeStep = 3;

export type ParameterHelpOption = "automatic" | "manual";
export const parameterHelpOptions: ParameterHelpOption[] = [
  "automatic",
  "manual",
];

// Case-insensitive: stored settings and inbound ?l= links predate the move
// to canonical id casing (zh-cn -> zh-CN etc.) and must keep working.
const findSupportedLanguage = (id: unknown): Language | undefined =>
  typeof id === "string"
    ? supportedLanguages.find((x) => x.id.toLowerCase() === id.toLowerCase())
    : undefined;

const languageHint = (): string | null =>
  new URLSearchParams(window.location.search).get("l");

export const getLanguageFromQuery = (): string => {
  return findSupportedLanguage(languageHint())?.id || supportedLanguages[0].id;
};

/**
 * The first-run language: the ?l= hint, then the browser/OS preferences,
 * matched against the supported languages; English otherwise.
 */
export const getDefaultLanguage = (): string =>
  getDefaultLanguageId({
    autoSelectableIds: supportedLanguages.map((l) => l.id),
    languageHint: languageHint(),
  });

export const defaultSettings: Settings = {
  languageId: getDefaultLanguage(),
  fontSize: defaultCodeFontSizePt,
  codeStructureHighlight: "full",
  parameterHelp: "automatic",
  showConnectHelp: true,
  showTransferHexHelp: true,
  showPostSaveHelp: true,
  showMultipleFilesHelp: true,
  allowEditingThirdPartyModules: false,
  warnForApiUnsupportedByDevice: true,
};

const inContextTranslationLangId = "lol";

export const isValidSettingsObject = (value: unknown): value is Settings => {
  if (typeof value !== "object") {
    return false;
  }
  const object = value as any;
  if (
    object.languageId &&
    object.languageId !== inContextTranslationLangId &&
    !findSupportedLanguage(object.languageId)
  ) {
    return false;
  }
  if (codeStructureOptions.indexOf(object.codeStructureHighlight) === -1) {
    return false;
  }
  if (parameterHelpOptions.indexOf(object.parameterHelp) === -1) {
    return false;
  }
  if (typeof object.showConnectHelp !== "boolean") {
    return false;
  }
  if (typeof object.showTransferHexHelp !== "boolean") {
    return false;
  }
  if (typeof object.showPostSaveHelp !== "boolean") {
    return false;
  }
  if (typeof object.showMultipleFilesHelp !== "boolean") {
    return false;
  }
  if (typeof object.allowEditingThirdPartyModules !== "boolean") {
    return false;
  }
  return true;
};

export type CodeStructureOption = "none" | "full" | "simple";
export const codeStructureOptions: CodeStructureOption[] = [
  "none",
  "full",
  "simple",
];
export interface Settings {
  languageId: string;
  fontSize: number;
  codeStructureHighlight: CodeStructureOption;
  parameterHelp: ParameterHelpOption;
  allowEditingThirdPartyModules: boolean;
  showConnectHelp: boolean;
  showTransferHexHelp: boolean;
  showPostSaveHelp: boolean;
  showMultipleFilesHelp: boolean;
  warnForApiUnsupportedByDevice: boolean;
}

export type SettingsContextValue = [Settings, (settings: Settings) => void];

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export const useSettings = (): SettingsContextValue => {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error("Missing provider");
  }
  return settings;
};

const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useStorage<Settings>(
    "local",
    "settings",
    defaultSettings,
    isValidSettingsObject,
    flags.translate
      ? { languageId: inContextTranslationLangId }
      : flags.noLang
      ? { languageId: getLanguageFromQuery() }
      : {}
  );
  return (
    <SettingsContext.Provider value={[settings, setSettings]}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
