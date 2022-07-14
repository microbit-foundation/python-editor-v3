/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useFileSystem } from "../fs/fs-hooks";
import { useSettings } from "../settings/settings";
import { LanguageServerClient } from "./client";
import {
  FsChangesListener,
  removeTrackFsChangesListener,
  trackFsChanges,
} from "./client-fs";
import { pyright } from "./pyright";

const LanguageServerClientContext = createContext<
  LanguageServerClient | undefined
>(undefined);

export const useLanguageServerClient = (): LanguageServerClient | undefined => {
  return useContext(LanguageServerClientContext);
};

interface LanguageServerClientProviderProps {
  children: ReactNode;
}

export const LanguageServerClientProvider = ({
  children,
}: LanguageServerClientProviderProps) => {
  const fs = useFileSystem();
  const [{ languageId }] = useSettings();
  const [clientState, setClientState] = useState<
    LanguageServerClient | undefined
  >(undefined);
  useEffect(() => {
    const client = pyright(languageId);
    setClientState(client);
    let listener: FsChangesListener | undefined;
    client?.initialize().then(() => {
      listener = trackFsChanges(client, fs);
    });
    return () => {
      if (listener) {
        removeTrackFsChangesListener(fs, listener);
      }
      client?.dispose();
    };
  }, [fs, languageId]);
  return (
    <LanguageServerClientContext.Provider value={clientState}>
      {children}
    </LanguageServerClientContext.Provider>
  );
};
