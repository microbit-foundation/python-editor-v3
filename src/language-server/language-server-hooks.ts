/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext } from "react";
import { LanguageServerClient } from "./client";

const LanguageServerClientContext = createContext<
  LanguageServerClient | undefined
>(undefined);

export const LanguageServerClientProvider =
  LanguageServerClientContext.Provider;

export const useLanguageServerClient = (): LanguageServerClient | undefined => {
  // It can be undefined if not supported (e.g. in Jest).
  return useContext(LanguageServerClientContext);
};
