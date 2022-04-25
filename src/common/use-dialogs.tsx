/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React, { ReactNode, useContext, useMemo, useState } from "react";
import {
  ConfirmDialog,
  ConfirmDialogParameters,
  ConfirmDialogParametersWithActions,
} from "./ConfirmDialog";
import {
  GenericDialog,
  GenericDialogParameters,
  GenericDialogParametersWithActions,
} from "./GenericDialog";
import {
  InputDialog,
  InputDialogParameters,
  InputDialogParametersWithActions,
} from "./InputDialog";
import ProgressDialog, { ProgressDialogParameters } from "./ProgressDialog";
import useRafState from "./use-raf-state";

const DialogContext = React.createContext<Dialogs | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const [confirmDialogState, setConfirmDialogState] = useState<
    ConfirmDialogParametersWithActions | undefined
  >(undefined);
  const [inputDialogState, setInputDialogState] = useState<
    InputDialogParametersWithActions<any> | undefined
  >(undefined);
  const [progressDialogState, setProgressDialogState] = useRafState<
    ProgressDialogParameters | undefined
  >(undefined);
  const [genericDialogState, setGenericDialogState] = useRafState<
    GenericDialogParametersWithActions | undefined
  >(undefined);

  const dialogs = useMemo(
    () =>
      new Dialogs(
        setConfirmDialogState,
        setInputDialogState,
        setProgressDialogState,
        setGenericDialogState
      ),
    [
      setConfirmDialogState,
      setInputDialogState,
      setProgressDialogState,
      setGenericDialogState,
    ]
  );
  return (
    <DialogContext.Provider value={dialogs}>
      <>
        {confirmDialogState && <ConfirmDialog isOpen {...confirmDialogState} />}
        {inputDialogState && <InputDialog isOpen {...inputDialogState} />}
        {progressDialogState && (
          <ProgressDialog isOpen {...progressDialogState} />
        )}
        {genericDialogState && <GenericDialog isOpen {...genericDialogState} />}
        {children}
      </>
    </DialogContext.Provider>
  );
};

export class Dialogs {
  constructor(
    private confirmDialogSetState: (
      options: ConfirmDialogParametersWithActions | undefined
    ) => void,
    private inputDialogSetState: (
      options: InputDialogParametersWithActions<any> | undefined
    ) => void,
    private progressDialogSetState: (
      options: ProgressDialogParameters | undefined
    ) => void,
    private genericDialogSetState: (
      options: GenericDialogParametersWithActions | undefined
    ) => void
  ) {}

  async confirm(options: ConfirmDialogParameters): Promise<boolean> {
    return new Promise((_resolve) => {
      const resolve = (result: boolean) => {
        this.confirmDialogSetState(undefined);
        _resolve(result);
      };
      this.confirmDialogSetState({
        ...options,
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true),
      });
    });
  }

  async input<T>(options: InputDialogParameters<T>): Promise<T | undefined> {
    return new Promise((_resolve) => {
      const resolve = (result: T | undefined) => {
        this.inputDialogSetState(undefined);
        _resolve(result);
      };
      this.inputDialogSetState({
        ...options,
        onCancel: () => resolve(undefined),
        onConfirm: (validValue: T) => resolve(validValue),
      });
    });
  }

  progress(options: ProgressDialogParameters): void {
    if (options.progress === undefined) {
      this.progressDialogSetState(undefined);
    } else {
      this.progressDialogSetState(options);
    }
  }

  generic(options: GenericDialogParameters): Promise<boolean> {
    return new Promise((_resolve) => {
      const resolve = (result: boolean) => {
        this.genericDialogSetState(undefined);
        _resolve(result);
      };
      this.genericDialogSetState({
        ...options,
        onCancel: () => resolve(false),
      });
    });
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
