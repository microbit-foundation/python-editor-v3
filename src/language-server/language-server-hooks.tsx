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
import { removeTrackFsChangesListener, trackFsChanges } from "./client-fs";
import { pyright } from "./pyright";

const LanguageServerClientContext = createContext<
  LanguageServerClient | undefined
>(undefined);

export const useLanguageServerClient = (): LanguageServerClient => {
  const value = useContext(LanguageServerClientContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

export const LanguageServerClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [client] = useState<LanguageServerClient | undefined>(pyright());
  const fs = useFileSystem();
  const [{ languageId }] = useSettings();
  useEffect(() => {
    client?.initialize(languageId, true).then(() => trackFsChanges(client, fs));
    return () => {
      removeTrackFsChangesListener(fs);
    };
  }, [client, fs, languageId]);
  return (
    <LanguageServerClientContext.Provider value={client}>
      {children}
    </LanguageServerClientContext.Provider>
  );
};
