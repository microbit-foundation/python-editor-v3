/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext } from "react";
import { LanguageServerClient } from "./client";

export const LanguageServerClientContext = createContext<
  LanguageServerClient | undefined
>(undefined);

export const useLanguageServerClient = (): LanguageServerClient | undefined => {
  // It can be undefined if not supported (e.g. in Jest).
  return useContext(LanguageServerClientContext);
};
