import React, { ReactNode, useContext, useEffect } from "react";
import useRafState from "../common/use-raf-state";
import { useSimulator } from "../device/device-hooks";
import { DataLog, LogData } from "../device/simulator";

const useDataLogInternal = (): DataLog => {
  const simulator = useSimulator();
  const [value, setValue] = useRafState<DataLog>(simulator.log);
  useEffect(() => {
    const listener = (event: LogData) => {
      setValue(event.log);
    };
    simulator.addEventListener("logdata", listener);
    return () => {
      simulator.removeEventListener("logdata", listener);
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
