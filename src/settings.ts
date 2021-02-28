import { createContext, SetStateAction, useContext } from "react";
import Settings from "./workbench/Settings";

interface Language {
  id: string;
  name: string;
}

export const supportedLanguages = [
  {
    id: "en",
    name: "English"
  }
];

export const minimumFontSize = 8;
export const maximumFontSize = 256;

export interface Settings {
  languageId: string;
  fontSize: number;
  highlightCodeStructure: boolean;
}

type SettingsContextValue = [
  Settings,
  React.Dispatch<SetStateAction<Settings>>
];

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
