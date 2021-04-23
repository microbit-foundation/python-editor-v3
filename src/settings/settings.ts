import { createContext, useContext } from "react";
import config from "../config";
import { defaultCodeFontSizePt } from "../theme";

export interface Language {
  id: string;
  name: string;
}

export const minimumFontSize = 4;
export const maximumFontSize = 154;
export const fontSizeStep = 3;

export const defaultSettings: Settings = {
  languageId: config.supportedLanguages[0].id,
  fontSize: defaultCodeFontSizePt,
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
