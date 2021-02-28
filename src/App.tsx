import React, { useEffect, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import "./App.css";
import { DeviceContext } from "./device/device-hooks";
import { MicrobitWebUSBConnection } from "./device";
import { FileSystem } from "./fs/fs";
import { FileSystemContext } from "./fs/fs-hooks";
import { Settings, SettingsContext, supportedLanguages } from "./settings";
import Workbench from "./workbench/Workbench";

const device = new MicrobitWebUSBConnection();
const fs = new FileSystem();

const App = () => {
  useEffect(() => {
    device.initialize();
    return () => {
      device.dispose();
    };
  }, []);

  // Persistence?
  const settings = useState<Settings>({
    languageId: supportedLanguages[0].id,
    fontSize: 18,
    highlightCodeStructure: true,
  });
  return (
    <ChakraProvider theme={theme}>
      <DeviceContext.Provider value={device}>
        <FileSystemContext.Provider value={fs}>
          <SettingsContext.Provider value={settings}>
            <Workbench />
          </SettingsContext.Provider>
        </FileSystemContext.Provider>
      </DeviceContext.Provider>
    </ChakraProvider>
  );
};

export default App;
