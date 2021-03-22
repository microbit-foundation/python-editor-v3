import React, { ReactNode, useContext, useMemo, useState } from "react";
import {
  ConfirmDialogParameters,
  ConfirmDialogParametersWithActions,
  ConfirmDialog,
} from "./ConfirmDialog";

const DialogContext = React.createContext<Dialogs | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const [state, setState] = useState<
    ConfirmDialogParametersWithActions | undefined
  >(undefined);
  const dialogs = useMemo(() => new Dialogs(setState), [setState]);
  return (
    <DialogContext.Provider value={dialogs}>
      <>
        {state && <ConfirmDialog isOpen {...state} />}
        {children}
      </>
    </DialogContext.Provider>
  );
};

export class Dialogs {
  constructor(
    private confirmDialogSetState: (
      options: ConfirmDialogParametersWithActions | undefined
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
}

export const useDialogs = () => {
  const dialogs = useContext(DialogContext);
  if (!dialogs) {
    throw new Error("Missing provider!");
  }
  return dialogs;
};
