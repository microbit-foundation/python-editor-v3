/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext } from "react";

export interface SessionSettings {
  dragDropSuccess: boolean;
}

export const defaultSessionSettings: SessionSettings = {
  dragDropSuccess: false,
};

export type SessionSettingsContextValue = [
  SessionSettings,
  (sessionSettings: SessionSettings) => void
];

const SessionSettingsContext = createContext<
  SessionSettingsContextValue | undefined
>(undefined);

export const SessionSettingsProvider = SessionSettingsContext.Provider;

export const useSessionSettings = (): SessionSettingsContextValue => {
  const sessionSettings = useContext(SessionSettingsContext);
  if (!sessionSettings) {
    throw new Error("Missing provider");
  }
  return sessionSettings;
};
