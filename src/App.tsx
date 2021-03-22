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
import { fetchMicroPython } from "./fs/micropython";
import { DialogProvider } from "./common/use-dialogs";

const logging = new DefaultLogging();
const device = new MicrobitWebUSBConnection({ logging });
const fs = new FileSystem(logging, fetchMicroPython);
// If this fails then we retry on access.
fs.initializeInBackground();

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
        <SettingsContext.Provider value={settings}>
          <DialogProvider>
            <DeviceContext.Provider value={device}>
              <FileSystemContext.Provider value={fs}>
                <ProjectDropTarget>
                  <Project />
                </ProjectDropTarget>
              </FileSystemContext.Provider>
            </DeviceContext.Provider>
          </DialogProvider>
        </SettingsContext.Provider>
      </LoggingContext.Provider>
    </ChakraProvider>
  );
};

export default App;
