import React, { ReactNode, useContext, useEffect } from "react";
import useRafState from "../common/use-raf-state";
import { useSimulator } from "../device/device-hooks";
import { DataLog, LogDataEvent } from "../device/simulator";

const useDataLogInternal = (): DataLog => {
  const simulator = useSimulator();
  const [value, setValue] = useRafState<DataLog>(simulator.log);
  useEffect(() => {
    const listener = (event: LogDataEvent) => {
      setValue(event.log);
    };
    simulator.addEventListener("log_data", listener);
    return () => {
      simulator.removeEventListener("log_data", listener);
    };
  }, [simulator, setValue]);
  return value;
};

const DataLogContext = React.createContext<DataLog | undefined>(undefined);

export const DataLogProvider = ({ children }: { children: ReactNode }) => {
  const table = useDataLogInternal();
  return (
    <DataLogContext.Provider value={table}>{children}</DataLogContext.Provider>
  );
};

export const useDataLog = () => {
  const result = useContext(DataLogContext);
  if (!result) {
    throw new Error("Missing provider!");
  }
  return result;
};
