/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext } from "react";
import { Logging } from "./logging";

// Exported for class-based error boundary.
export const LoggingContext = createContext<Logging | undefined>(undefined);

export const LoggingProvider = LoggingContext.Provider;

/**
 * Hook exposing logging.
 */
export const useLogging = (): Logging => {
  const logging = useContext(LoggingContext);
  if (!logging) {
    throw new Error("Missing provider");
  }
  return logging;
};
