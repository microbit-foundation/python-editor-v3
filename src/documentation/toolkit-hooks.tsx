/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { ApiDocsResponse } from "../language-server/apidocs";
import {
  State as ExploreState,
  useApiDocs,
  useExploreToolkit,
} from "./documentation-hooks";

export interface ToolkitContextValue {
  exploreToolkit: ExploreState;
  referenceToolkit: ApiDocsResponse | undefined;
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
  const exploreToolkit = useExploreToolkit();
  const referenceToolkit = useApiDocs();

  const value: ToolkitContextValue = useMemo(() => {
    return { exploreToolkit, referenceToolkit };
  }, [exploreToolkit, referenceToolkit]);
  return (
    <ToolkitContext.Provider value={value}>{children}</ToolkitContext.Provider>
  );
};

export default ToolkitProvider;
