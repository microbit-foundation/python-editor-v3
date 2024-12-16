/**
 * Hooks to perform actions on the current editor.
 *
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { redo, undo } from "@codemirror/commands";
import { EditorView } from "@codemirror/view";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ActionFeedback } from "../common/use-action-feedback";
import { Logging } from "../logging/logging";
import { copyCodeSnippet } from "./codemirror/copypaste";
import { CodeInsertType } from "./codemirror/dnd";
import { IntlShape } from "react-intl";

/**
 * Actions that operate on a CM editor.
 */
export class EditorActions {
  constructor(
    private view: EditorView,
    private logging: Logging,
    private actionFeedback: ActionFeedback,
    private intl: IntlShape
  ) {}

  copyCode = async (
    code: string,
    codeWithImports: string,
    type: CodeInsertType,
    id?: string
  ): Promise<void> => {
    this.logging.event({
      type: "code-copy",
      message: id,
    });
    copyCodeSnippet({
      code,
      codeWithImports,
      type,
      id,
    });
    this.actionFeedback.success({
      title: this.intl.formatMessage({ id: "copy-snippet-advice" }),
    });
  };
  undo = (): void => {
    this.logging.event({
      type: "undo",
    });
    undo(this.view);
    this.view.focus();
  };
  redo = (): void => {
    this.logging.event({
      type: "redo",
    });
    redo(this.view);
    this.view.focus();
  };
}

type UseActiveEditorReturn = [
  EditorActions | undefined,
  Dispatch<SetStateAction<EditorActions | undefined>>
];

const ActiveEditorActionsContext = React.createContext<
  UseActiveEditorReturn | undefined
>(undefined);

export interface EditorInfo {
  /**
   * The size of the undo stack.
   */
  undo: number;
  /**
   * The size of the redo stack.
   */
  redo: number;
}

export const defaultEditorInfo: EditorInfo = {
  undo: 0,
  redo: 0,
};

type UseActiveEditorInfoReturn = [
  EditorInfo,
  Dispatch<SetStateAction<EditorInfo>>
];

const ActiveEditorStateContext = React.createContext<
  UseActiveEditorInfoReturn | undefined
>(undefined);

const ActiveEditorStateProvider = ({ children }: { children: ReactNode }) => {
  const value = useState<EditorInfo>(defaultEditorInfo);
  return (
    <ActiveEditorStateContext.Provider value={value}>
      {children}
    </ActiveEditorStateContext.Provider>
  );
};
interface ActiveEditorProviderProps {
  children: ReactNode;
}

export const ActiveEditorProvider = ({
  children,
}: ActiveEditorProviderProps) => {
  const actions = useState<EditorActions>();
  return (
    <ActiveEditorActionsContext.Provider value={actions}>
      <ActiveEditorStateProvider>{children}</ActiveEditorStateProvider>
    </ActiveEditorActionsContext.Provider>
  );
};

/**
 * Used to update the active editor actions from CM.
 * Prefer {@link useActiveEditorActions} or {@link useActiveEditorInfoState}.
 */
export const useActiveEditorActionsState = (): UseActiveEditorReturn => {
  const value = useContext(ActiveEditorActionsContext);
  if (!value) {
    throw new Error("Missing provider");
  }
  return value;
};

/**
 * Used to update the editor info from CM.
 * Prefer {@link useActiveEditorActions} or {@link useActiveEditorInfoState}.
 */
export const useActiveEditorInfoState = (): UseActiveEditorInfoReturn => {
  const context = useContext(ActiveEditorStateContext);
  if (!context) {
    throw new Error("Missing provider!");
  }
  return context;
};

/**
 * Information on the active editor.
 */
export const useActiveEditorInfo = (): EditorInfo => {
  return useActiveEditorInfoState()[0];
};

/**
 * Actions that affect the current editor.
 */
export const useActiveEditorActions = (): EditorActions | undefined => {
  return useActiveEditorActionsState()?.[0];
};
