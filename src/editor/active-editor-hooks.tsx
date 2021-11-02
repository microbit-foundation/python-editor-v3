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
   * The logic used at the moment is pretty simple but we plan to improve this.
   *
   * @param code The code with any required imports.
   */
  insertCode = (code: string): void => {
    const state = this.view.state;
    const changes = calculateChanges(state, code);
    const changeSet = state.changes(changes);
    const lastChange = changes[changes.length - 1];
    const updatedSelection =
      changeSet.mapPos(lastChange.from) + lastChange.insert.trim().length;
    const transaction = state.update({
      changes: changeSet,
      selection: { anchor: updatedSelection },
      scrollIntoView: true,
    });
    this.view.dispatch(transaction);
    this.view.focus();
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
