import { ChakraProvider } from "@chakra-ui/react";
import React, { useEffect } from "react";
import "./App.css";
import { DialogProvider } from "./common/use-dialogs";
import { useLocalStorage } from "./common/use-local-storage";
import VisualViewPortCSSVariables from "./common/VisualViewportCSSVariables";
import { MicrobitWebUSBConnection } from "./device/device";
import { DeviceContext } from "./device/device-hooks";
import { FileSystem } from "./fs/fs";
import { FileSystemContext } from "./fs/fs-hooks";
import { fetchMicroPython } from "./fs/micropython";
import { DefaultLogging } from "./logging/default";
import { LoggingContext } from "./logging/logging-hooks";
import ProjectDropTarget from "./project/ProjectDropTarget";
import {
  defaultSettings,
  isValidSettingsObject,
  Settings,
  SettingsContext,
} from "./settings/settings";
import theme from "./theme";
import BeforeUnloadDirtyCheck from "./workbench/BeforeUnloadDirtyCheck";
import { SelectionContext } from "./workbench/use-selection";
import Workbench from "./workbench/Workbench";

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
    <>
      <VisualViewPortCSSVariables />
      <ChakraProvider theme={theme}>
        <LoggingContext.Provider value={logging}>
          <SettingsContext.Provider value={settings}>
            <DialogProvider>
              <DeviceContext.Provider value={device}>
                <FileSystemContext.Provider value={fs}>
                  <BeforeUnloadDirtyCheck />
                  <SelectionContext>
                    <ProjectDropTarget>
                      <Workbench />
                    </ProjectDropTarget>
                  </SelectionContext>
                </FileSystemContext.Provider>
              </DeviceContext.Provider>
            </DialogProvider>
          </SettingsContext.Provider>
        </LoggingContext.Provider>
      </ChakraProvider>
    </>
  );
};

export default App;
