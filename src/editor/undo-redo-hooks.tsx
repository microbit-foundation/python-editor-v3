/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext } from "react";

export interface UndoRedo {
  undo: number;
  redo: number;
}

export const defaultUndoRedo: UndoRedo = {
  undo: 0,
  redo: 0,
};

type UndoRedoContextValue = [UndoRedo, (undoRedo: UndoRedo) => void];

const UndoRedoContext = createContext<UndoRedoContextValue | undefined>(
  undefined
);

export const UndoRedoProvider = UndoRedoContext.Provider;

export const useUndoRedo = (): UndoRedoContextValue => {
  const undoRedo = useContext(UndoRedoContext);
  if (!undoRedo) {
    throw new Error("Missing provider");
  }
  return undoRedo;
};
