import React, { ReactNode, useContext, useEffect } from "react";
import useRafState from "../common/use-raf-state";
import { useSimulator } from "../device/device-hooks";
import { EVENT_LOG_DATA } from "../device/simulator";

export interface DataLog {
  headings: string[];
  data: DataLogRow[];
}

export interface DataLogRow {
  isHeading?: boolean;
  data: string[];
}

const useDataLogInternal = (): DataLog => {
  const simulator = useSimulator();
  const [value, setValue] = useRafState<DataLog>(simulator.log);
  useEffect(() => {
    simulator.on(EVENT_LOG_DATA, setValue);
    return () => {
      simulator.removeListener(EVENT_LOG_DATA, setValue);
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
