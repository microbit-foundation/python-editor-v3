import React, { useContext } from "react";

export interface LineInfoContext {
    statementType?: "CALL",
    callInfo?: {
        name: string,
        arguments: string[]
    },
    // This is defined by the extension, and it will update the arguments and the context info
    updateArguments: (args: string[]) => void,

    reduce: (change: Partial<LineInfoContext>) => void
}

//giving me errors if I don't put some default value
export const LineInfoContext = React.createContext<LineInfoContext>({
    updateArguments() {},
    reduce() {}
});

export function LineInfoProvider({ children }: {children: any}) {
    const [lineInfo, setLineInfo] = React.useState<LineInfoContext>({
        updateArguments() {},
        reduce() {}
    });
  
  
    return (
      <LineInfoContext.Provider value={{
        ...lineInfo,
        reduce(change) {
            setLineInfo({
                ...lineInfo,
                ...change
            })
        }
      }}>
        {children}
      </LineInfoContext.Provider>
    );
  };