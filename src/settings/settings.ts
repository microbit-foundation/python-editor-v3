import { createContext, SetStateAction, useContext } from "react";
import config from "../config";

export interface Language {
  id: string;
  name: string;
}

export const minimumFontSize = 6;
export const maximumFontSize = 198;
export const fontSizeStep = 4;

export const defaultSettings: Settings = {
  languageId: config.supportedLanguages[0].id,
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
