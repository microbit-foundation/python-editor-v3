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
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { MAIN_FILE } from "../fs/fs";
import { useProjects } from "../project/projects-hooks";
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

/**
 * Resets the (global) workbench selection to main.py whenever a different
 * project becomes active, so switching/loading/creating a project always
 * opens main.py rather than leaking the previously open file.
 *
 * Note: this deliberately does not remember the open file per project. See
 * team notes if we want to revisit per-project file memory.
 *
 * Call once from the workbench.
 */
export const useProjectScopedSelection = () => {
  const { loadedProjectId } = useProjects();
  const [, setSelection] = useSelection();
  const activeProjectRef = useRef<string | undefined>(undefined);

  // useLayoutEffect (not useEffect) so the reset happens before the browser
  // paints: reopening a project must not briefly show the previously active
  // file before switching back to main.py.
  useLayoutEffect(() => {
    if (activeProjectRef.current === loadedProjectId) {
      return;
    }
    activeProjectRef.current = loadedProjectId;
    setSelection({ file: MAIN_FILE, location: { line: undefined } });
  }, [loadedProjectId, setSelection]);
};
