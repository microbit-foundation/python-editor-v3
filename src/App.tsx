import { ChakraProvider } from "@chakra-ui/react";
import { useEffect } from "react";
import "./App.css";
import { DialogProvider } from "./common/use-dialogs";
import { useLocalStorage } from "./common/use-local-storage";
import VisualViewPortCSSVariables from "./common/VisualViewportCSSVariables";
import { deployment, useDeployment } from "./deployment";
import { MicrobitWebUSBConnection } from "./device/device";
import { DeviceContext } from "./device/device-hooks";
import { FileSystem } from "./fs/fs";
import { FileSystemContext } from "./fs/fs-hooks";
import { fetchMicroPython } from "./fs/micropython";
import { LoggingContext } from "./logging/logging-hooks";
import ProjectDropTarget from "./project/ProjectDropTarget";
import {
  defaultSettings,
  isValidSettingsObject,
  Settings,
  SettingsContext,
} from "./settings/settings";
import BeforeUnloadDirtyCheck from "./workbench/BeforeUnloadDirtyCheck";
import { SelectionContext } from "./workbench/use-selection";
import Workbench from "./workbench/Workbench";

const logging = deployment.logging;
const device = new MicrobitWebUSBConnection({ logging });
const fs = new FileSystem(logging, fetchMicroPython);
// If this fails then we retry on access.
fs.initializeInBackground();

const App = () => {
  useEffect(() => {
    logging.event({ action: "boot" });
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

  const deployment = useDeployment();
  return (
    <>
      <VisualViewPortCSSVariables />
      <ChakraProvider theme={deployment.chakraTheme}>
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
