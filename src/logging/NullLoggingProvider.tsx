import { ReactNode } from "react";
import { NullLogging } from "../deployment/default/logging";
import { LoggingProvider } from "./logging-hooks";

const NullLoggingProvider = ({ children }: { children: ReactNode }) => (
  <LoggingProvider value={new NullLogging()}>{children}</LoggingProvider>
);

export default NullLoggingProvider;
