/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { MAIN_FILE } from "../fs/fs";
const Selection = React.createContext<
  [WorkbenchSelection, Dispatch<SetStateAction<WorkbenchSelection>>] | undefined
>(undefined);

/**
 * The workbench selection.
 */
export interface WorkbenchSelection {
  /**
   * Always defined as we don't let the user delete the main file and default
   * to having it open.
   */
  file: string;

  /**
   * The line to display when first opening the file.
   *
   * Identity changes when the user performs a navigation.
   */
  location: FileLocation;
}

export interface FileLocation {
  line: number | undefined;
}

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

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const state = useState<WorkbenchSelection>({
    file: MAIN_FILE,
    location: { line: undefined },
  });
  return <Selection.Provider value={state}>{children}</Selection.Provider>;
};
