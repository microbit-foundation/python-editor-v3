/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChakraProvider } from "@chakra-ui/react";
import { useEffect } from "react";
import "./App.css";
import { DialogProvider } from "./common/use-dialogs";
import { useLocalStorage } from "./common/use-local-storage";
import VisualViewPortCSSVariables from "./common/VisualViewportCSSVariables";
import { deployment, useDeployment } from "./deployment";
import { MicrobitWebUSBConnection } from "./device/device";
import { DeviceContextProvider } from "./device/device-hooks";
import { MockDeviceConnection } from "./device/mock";
import { FileSystem } from "./fs/fs";
import { FileSystemProvider } from "./fs/fs-hooks";
import { createInitialProject } from "./fs/initial-project";
import { fetchMicroPython } from "./fs/micropython";
import { trackFsChanges } from "./language-server/client-fs";
import { LanguageServerClientProvider } from "./language-server/language-server-hooks";
import { pyright } from "./language-server/pyright";
import { LoggingProvider } from "./logging/logging-hooks";
import TranslationProvider from "./messages/TranslationProvider";
import ProjectDropTarget from "./project/ProjectDropTarget";
import { RouterProvider } from "./router-hooks";
import {
  defaultSettings,
  isValidSettingsObject,
  Settings,
  SettingsProvider,
} from "./settings/settings";
import BeforeUnloadDirtyCheck from "./workbench/BeforeUnloadDirtyCheck";
import { SelectionProvider } from "./workbench/use-selection";
import Workbench from "./workbench/Workbench";

const isMockDeviceMode = () =>
  // We use a cookie set from the e2e tests. Avoids having separate test and live builds.
  Boolean(
    document.cookie.split("; ").find((row) => row.startsWith("mockDevice="))
  );

const logging = deployment.logging;
const device = isMockDeviceMode()
  ? new MockDeviceConnection()
  : new MicrobitWebUSBConnection({ logging });

const client = pyright();
const fs = new FileSystem(
  logging,
  createInitialProject(window.location.href),
  fetchMicroPython
);
client?.initialize().then(() => trackFsChanges(client, fs));

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
        <LoggingProvider value={logging}>
          <SettingsProvider value={settings}>
            <TranslationProvider>
              <DialogProvider>
                <DeviceContextProvider value={device}>
                  <FileSystemProvider value={fs}>
                    <LanguageServerClientProvider value={client}>
                      <BeforeUnloadDirtyCheck />
                      <SelectionProvider>
                        <RouterProvider>
                          <ProjectDropTarget>
                            <Workbench />
                          </ProjectDropTarget>
                        </RouterProvider>
                      </SelectionProvider>
                    </LanguageServerClientProvider>
                  </FileSystemProvider>
                </DeviceContextProvider>
              </DialogProvider>
            </TranslationProvider>
          </SettingsProvider>
        </LoggingProvider>
      </ChakraProvider>
    </>
  );
};

export default App;
