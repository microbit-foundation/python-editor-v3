/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext } from "react";
import { useStorage } from "../common/use-storage";
import { defaultCodeFontSizePt } from "../deployment/misc";
import { stage } from "../environment";

export interface Language {
  id: string;
  name: string;
  enName: string;
}

// When we add languages we need to update the toolkit search indexing,
// which will require the dynamic import of a new language plugin for lunr.
// See search.ts.
export const supportedLanguages: Language[] = [
  {
    id: "en",
    name: "English",
    enName: "English",
  },
  {
    id: "fr",
    name: "Français",
    enName: "French",
  },
];
if (stage === "REVIEW" || process.env.NODE_ENV !== "production") {
  supportedLanguages.push({
    id: "lol", // This has to be a valid locale value, so can't be e.g. "test".
    name: "Translation test",
    enName: "Translation test",
  });
}

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
};

export const isValidSettingsObject = (value: unknown): value is Settings => {
  if (typeof value !== "object") {
    return false;
  }
  const object = value as any;
  if (
    object.languageId &&
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
}

type SettingsContextValue = [Settings, (settings: Settings) => void];

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
  const settings = useStorage<Settings>(
    "local",
    "settings",
    defaultSettings,
    isValidSettingsObject
  );
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
