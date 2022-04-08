/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { ApiDocsResponse } from "../language-server/apidocs";
import {
  ReferenceToolkitState,
  useApiDocs,
  useReferenceToolkit,
  IdeasToolkitState,
  useIdeasToolkit,
} from "./documentation-hooks";

export interface ToolkitContextValue {
  referenceToolkit: ReferenceToolkitState;
  apiToolkit: ApiDocsResponse | undefined;
  ideasToolkit: IdeasToolkitState;
}

const ToolkitContext = createContext<ToolkitContextValue | undefined>(
  undefined
);

export const useToolkitState = (): ToolkitContextValue => {
  const value = useContext(ToolkitContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const ToolkitProvider = ({ children }: { children: ReactNode }) => {
  const referenceToolkit = useReferenceToolkit();
  const apiToolkit = useApiDocs();
  const ideasToolkit = useIdeasToolkit();

  const value: ToolkitContextValue = useMemo(() => {
    return { referenceToolkit, apiToolkit, ideasToolkit };
  }, [referenceToolkit, apiToolkit, ideasToolkit]);
  return (
    <ToolkitContext.Provider value={value}>{children}</ToolkitContext.Provider>
  );
};

export default ToolkitProvider;
