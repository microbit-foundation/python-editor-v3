/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext } from "react";
import { useStorage } from "../common/use-storage";
import { defaultCodeFontSizePt } from "../deployment/misc";
import { stage } from "../environment";
import { flags } from "../flags";

export interface Language {
  id: string;
  name: string;
  enName: string;
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
  {
    id: "en",
    name: "English",
    enName: "English",
  },
  {
    id: "ca",
    name: "Català",
    enName: "Catalan",
  },
  {
    id: "zh-cn",
    name: "简体中文",
    enName: "Chinese (Simplified)",
  },
  {
    id: "zh-tw",
    name: "繁體中文",
    enName: "Chinese (Traditional)",
  },
  {
    id: "nl",
    name: "Nederlands",
    enName: "Dutch",
  },
  {
    id: "fr",
    name: "Français",
    enName: "French",
  },
  {
    id: "de",
    name: "Deutsch",
    enName: "German",
    preview: true,
  },
  {
    id: "ga-ie",
    name: "Gaeilge",
    enName: "Irish",
    preview: true,
  },
  {
    id: "ja",
    name: "日本語",
    enName: "Japanese",
  },
  {
    id: "ko",
    name: "한국어",
    enName: "Korean",
  },
  {
    id: "pl",
    name: "Polski",
    enName: "Polish",
  },
  {
    id: "es-es",
    name: "Español",
    enName: "Spanish",
  },
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

export const getLanguageFromQuery = (): string => {
  const searchParams = new URLSearchParams(window.location.search);
  const l = searchParams.get("l");
  const supportedLanguage = supportedLanguages.find((x) => x.id === l);
  return supportedLanguage?.id || supportedLanguages[0].id;
};

export const defaultSettings: Settings = {
  languageId: getLanguageFromQuery(),
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
    !supportedLanguages.find((x) => x.id === object.languageId)
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
