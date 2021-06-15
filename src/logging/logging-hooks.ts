import { createContext, useContext } from "react";
import { Logging } from "./logging";

export const LoggingContext = createContext<Logging | undefined>(undefined);

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
