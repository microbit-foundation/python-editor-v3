import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { MAIN_FILE } from "../fs/fs";
const Selection = React.createContext<
  [string, Dispatch<SetStateAction<string>>] | undefined
>(undefined);

/**
 * Hook exposing the context selection.
 */
export const useSelection = () => {
  const value = useContext(Selection);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

export const SelectionContext = ({ children }: { children: ReactNode }) => {
  const state = useState(MAIN_FILE);
  return <Selection.Provider value={state}>{children}</Selection.Provider>;
};
