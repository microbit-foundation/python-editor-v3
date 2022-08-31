import React, { ReactNode, useContext, useEffect, useState } from "react";
import { useSimulator } from "../device/device-hooks";
import {
  EVENT_LOG_DATA,
  EVENT_LOG_DELETE,
  LogEntry,
} from "../device/simulator";

export interface DataLog {
  headings: string[];
  data: DataLogRow[];
}

export interface DataLogRow {
  isHeading?: boolean;
  data: string[];
}

const initialState = {
  headings: [],
  data: [],
};

const useDataLogInternal = (): DataLog => {
  const [table, setTable] = useState<DataLog>(initialState);

  const simulator = useSimulator();
  useEffect(() => {
    const handleLogData = ({ headings, data }: LogEntry) => {
      setTable((table) => {
        const result: DataLog = {
          headings: headings ?? table.headings,
          data: [...table.data],
        };
        // The first row is all-time headings row so don't show the initial set.
        if (headings && table.data.length > 0) {
          result.data.push({ isHeading: true, data: headings });
        }
        if (data) {
          result.data.push({ data });
        }
        return result;
      });
    };
    const handleLogDelete = () => setTable(initialState);
    simulator.on(EVENT_LOG_DATA, handleLogData);
    simulator.on(EVENT_LOG_DELETE, handleLogDelete);
    return () => {
      simulator.removeListener(EVENT_LOG_DELETE, handleLogDelete);
      simulator.removeListener(EVENT_LOG_DATA, handleLogData);
    };
  }, [simulator, setTable]);
  return table;
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
