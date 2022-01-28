/**
 * Hooks to perform actions on the current editor.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorView } from "@codemirror/view";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { undo, redo, undoDepth, redoDepth } from "@codemirror/history";
import { calculateChanges } from "./codemirror/edits";

type ActiveEditorState = [
  ActiveEditorActions | undefined,
  Dispatch<SetStateAction<ActiveEditorActions | undefined>>
];

const ActiveEditorContext = React.createContext<ActiveEditorState | undefined>(
  undefined
);

export const useActiveEditor = (): ActiveEditorState => {
  const context = useContext(ActiveEditorContext);
  if (!context) {
    throw new Error();
  }
  return context;
};

export const useActiveEditorActions = (): ActiveEditorActions | undefined => {
  return useActiveEditor()?.[0];
};

/**
 * Actions that operate on the active editor.
 */
export class ActiveEditorActions {
  constructor(private view: EditorView) {}

  /**
   * A smart, import-aware code insert.
   *
   * @param code The code with any required imports.
   */
  insertCode = (code: string): void => {
    this.view.dispatch(calculateChanges(this.view.state, code, "example"));
    this.view.focus();
  };
  undo = (): void => {
    undo(this.view);
  };
  getUndoEventNum = (): number => {
    return undoDepth(this.view.state);
  };
  redo = (): void => {
    redo(this.view);
  };
  getRedoEventNum = (): number => {
    return redoDepth(this.view.state);
  };
}

interface ActiveEditorProviderProps {
  children: ReactNode;
}

export const ActiveEditorProvider = ({
  children,
}: ActiveEditorProviderProps) => {
  const value = useState<ActiveEditorActions>();
  return (
    <ActiveEditorContext.Provider value={value}>
      {children}
    </ActiveEditorContext.Provider>
  );
};
