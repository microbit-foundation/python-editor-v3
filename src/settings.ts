import { createContext, SetStateAction, useContext } from "react";
import Settings from "./workbench/Settings";

export interface Language {
  id: string;
  name: string;
}

export const supportedLanguages: Language[] = [
  {
    id: "en",
    name: "English",
  },
];

export const minimumFontSize = 8;
export const maximumFontSize = 256;

export const defaultSettings: Settings = {
  languageId: supportedLanguages[0].id,
  fontSize: 18,
  highlightCodeStructure: true,
};

export const isValidSettingsObject = (value: unknown): value is Settings => {
  if (typeof value !== "object") {
    return false;
  }
  // TODO: more!
  return true;
};

export interface Settings {
  languageId: string;
  fontSize: number;
  highlightCodeStructure: boolean;
}

type SettingsContextValue = [Settings, (settings: Settings) => void];

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export const useSettings = (): SettingsContextValue => {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error("Missing provider");
  }
  return settings;
};
