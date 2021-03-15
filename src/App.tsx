import React, { useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import "./App.css";
import { DeviceContext } from "./device/device-hooks";
import { MicrobitWebUSBConnection } from "./device/device";
import { FileSystem } from "./fs/fs";
import { FileSystemContext } from "./fs/fs-hooks";
import {
  defaultSettings,
  isValidSettingsObject,
  Settings,
  SettingsContext,
} from "./settings/settings";
import { useLocalStorage } from "./common/use-local-storage";
import Project from "./project/Project";
import ProjectDropTarget from "./project/ProjectDropTarget";
import { LoggingContext } from "./logging/logging-hooks";
import { DefaultLogging } from "./logging/default";

const logging = new DefaultLogging();
const device = new MicrobitWebUSBConnection({ logging });
const fs = new FileSystem();

const App = () => {
  useEffect(() => {
    device.initialize();
    return () => {
      device.dispose();
    };
  }, []);

  const settings = useLocalStorage<Settings>(
    "settings",
    isValidSettingsObject,
    defaultSettings
  );

  return (
    <ChakraProvider theme={theme}>
      <LoggingContext.Provider value={logging}>
        <DeviceContext.Provider value={device}>
          <FileSystemContext.Provider value={fs}>
            <SettingsContext.Provider value={settings}>
              <ProjectDropTarget>
                <Project />
              </ProjectDropTarget>
            </SettingsContext.Provider>
          </FileSystemContext.Provider>
        </DeviceContext.Provider>
      </LoggingContext.Provider>
    </ChakraProvider>
  );
};

export default App;
