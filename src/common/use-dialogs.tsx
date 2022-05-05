/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode, useContext, useMemo } from "react";
import useRafState from "./use-raf-state";
import ProgressDialog, { ProgressDialogParameters } from "./ProgressDialog";

const DialogContext = React.createContext<Dialogs | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const [dialogState, setDialogState] = useRafState<ReactNode | undefined>(
    undefined
  );
  const [progressDialogState, setProgressDialogState] = useRafState<
    ProgressDialogParameters | undefined
  >(undefined);
  const dialogs = useMemo(
    () => new Dialogs(setDialogState, setProgressDialogState),
    [setDialogState, setProgressDialogState]
  );
  return (
    <DialogContext.Provider value={dialogs}>
      <>
        {dialogState}
        {progressDialogState && (
          <ProgressDialog isOpen {...progressDialogState} />
        )}
        {children}
      </>
    </DialogContext.Provider>
  );
};

export class Dialogs {
  constructor(
    private dialogSetState: (node: ReactNode) => void,
    private progressDialogSetState: (
      options: ProgressDialogParameters | undefined
    ) => void
  ) {}

  /**
   * Show a dialog and wait until it calls the callback.
   *
   * @param dialogFactory Creates the dialog.
   * @returns The value passed to the callback.
   */
  show<T>(
    dialogFactory: (callback: (result: T) => void) => ReactNode
  ): Promise<T> {
    return new Promise<T>((_resolve) => {
      const resolve = (result: T) => {
        this.dialogSetState(undefined);
        _resolve(result);
      };
      const dialog = dialogFactory(resolve);
      this.dialogSetState(dialog);
    });
  }

  progress(options: ProgressDialogParameters): void {
    if (options.progress === undefined) {
      this.progressDialogSetState(undefined);
    } else {
      this.progressDialogSetState(options);
    }
  }
}

/**
 * A hook providing common dialog functionality.
 */
export const useDialogs = () => {
  const dialogs = useContext(DialogContext);
  if (!dialogs) {
    throw new Error("Missing provider!");
  }
  return dialogs;
};
