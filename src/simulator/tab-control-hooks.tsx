/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, use, useState } from "react";

type SimSerialTabControl = [
  tabOutRef: HTMLElement | null,
  setTabOutRef: React.Dispatch<React.SetStateAction<HTMLElement | null>>
];

const SimSerialTabControlContext = createContext<
  SimSerialTabControl | undefined
>(undefined);

export const useSimSerialTabControl = (): SimSerialTabControl => {
  const simSerialTabControl = use(SimSerialTabControlContext);
  if (!simSerialTabControl) {
    throw new Error("Missing provider");
  }
  return simSerialTabControl;
};

const SimSerialTabControlProvider = ({ children }: { children: ReactNode }) => {
  // eslint-disable-next-line @eslint-react/use-state -- the tuple is handed to context as-is
  const value = useState<HTMLElement | null>(null);
  return (
    <SimSerialTabControlContext value={value}>
      {children}
    </SimSerialTabControlContext>
  );
};

export default SimSerialTabControlProvider;
