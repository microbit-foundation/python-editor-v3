import { ReactNode, createContext, useContext, useState } from "react";
import { ActionData } from "./training-data";

type ModelDataContextValue = [ActionData[], (mlData: ActionData[]) => void];

const ModelDataContext = createContext<ModelDataContextValue | undefined>(
  undefined
);

export const useModelData = (): ModelDataContextValue => {
  const modelData = useContext(ModelDataContext);
  if (!modelData) {
    throw new Error("Missing provider");
  }
  return modelData;
};

const MlDataProvider = ({ children }: { children: ReactNode }) => {
  const [modelData, setModelData] = useState<ActionData[]>([]);
  return (
    <ModelDataContext.Provider value={[modelData, setModelData]}>
      {children}
    </ModelDataContext.Provider>
  );
};

export default MlDataProvider;
