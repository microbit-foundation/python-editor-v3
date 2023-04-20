import { Transaction } from "@codemirror/state";
import React, { useContext } from "react";

export interface LineInfo {
  statementType: "CALL";
  callInfo: {
    moduleName?: string;
    name: string;
    arguments: string[];
  };

  createArgumentUpdate: (args: string[]) => Transaction;
}

type LineInfoContextValue = [
  LineInfo | undefined,
  React.Dispatch<React.SetStateAction<LineInfo | undefined>>
];

const LineInfoContext = React.createContext<LineInfoContextValue | undefined>(
  undefined
);

export const useLineInfo = () => {
  const value = useContext(LineInfoContext);
  if (!value) {
    throw new Error("Missing provider");
  }
  return value;
};

export function LineInfoProvider({ children }: { children: any }) {
  const stateReturn = React.useState<LineInfo | undefined>();
  return (
    <LineInfoContext.Provider value={stateReturn}>
      {children}
    </LineInfoContext.Provider>
  );
}
