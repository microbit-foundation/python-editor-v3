/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";
import { createContext, ReactNode, useContext } from "react";

export interface ConnectDialogsValue {
  connectHelpDisclosure: UseDisclosureReturn;
  firmwareDisclosure: UseDisclosureReturn;
  notFoundDisclosure: UseDisclosureReturn;
}

const ConnectDialogsContext = createContext<ConnectDialogsValue | undefined>(
  undefined
);

export const useConnectDialogs = (): ConnectDialogsValue => {
  const value = useContext(ConnectDialogsContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

export const ConnectDialogsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const value = {
    connectHelpDisclosure: useDisclosure(),
    firmwareDisclosure: useDisclosure(),
    notFoundDisclosure: useDisclosure(),
  };
  return (
    <ConnectDialogsContext.Provider value={value}>
      {children}
    </ConnectDialogsContext.Provider>
  );
};
