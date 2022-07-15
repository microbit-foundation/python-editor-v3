/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext } from "react";
import { useStorage } from "../common/use-storage";

export interface SessionSettings {
  dragDropSuccess: boolean;
  showWebUsbNotSupported: boolean;
}

export const defaultSessionSettings: SessionSettings = {
  dragDropSuccess: false,
  showWebUsbNotSupported: true,
};

export type SessionSettingsContextValue = [
  SessionSettings,
  (sessionSettings: SessionSettings) => void
];

const SessionSettingsContext = createContext<
  SessionSettingsContextValue | undefined
>(undefined);

export const useSessionSettings = (): SessionSettingsContextValue => {
  const sessionSettings = useContext(SessionSettingsContext);
  if (!sessionSettings) {
    throw new Error("Missing provider");
  }
  return sessionSettings;
};

const SessionSettingsProvider = ({ children }: { children: ReactNode }) => {
  const sessionSettings = useStorage<SessionSettings>(
    "session",
    "sessionSettings",
    defaultSessionSettings
  );
  return (
    <SessionSettingsContext.Provider value={sessionSettings}>
      {children}
    </SessionSettingsContext.Provider>
  );
};

export default SessionSettingsProvider;
