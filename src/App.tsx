/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChakraProvider } from "@chakra-ui/react";
import { polyfill } from "mobile-drag-drop";
import { useEffect } from "react";
import "./App.css";
import { DialogProvider } from "./common/use-dialogs";
import VisualViewPortCSSVariables from "./common/VisualViewportCSSVariables";
import { deployment, useDeployment } from "./deployment";
import { createUSBConnection } from "@microbit/microbit-connection/usb";
import { CHANGE, DEVICE_CHANGE, ROLE_MANAGER_CHANGE } from "jacdac-ts";
import { DeviceContextProvider } from "./device/device-hooks";
import { MockDeviceConnection } from "./device/mock";
import { JacdacAssignmentsProvider } from "./jacdac/jacdac-assignments";
import { createJacdacBus } from "./jacdac/jacdac-bus";
import { JacdacProvider } from "./jacdac/jacdac-hooks";
import DocumentationProvider from "./documentation/documentation-hooks";
import SearchProvider from "./documentation/search/search-hooks";
import { ActiveEditorProvider } from "./editor/active-editor-hooks";
import { FileSystem } from "./fs/fs";
import { FileSystemProvider } from "./fs/fs-hooks";
import { createHost } from "./fs/host";
import { fetchMicroPython } from "./micropython/micropython";
import { LanguageServerClientProvider } from "./language-server/language-server-hooks";
import { LoggingProvider } from "./logging/logging-hooks";
import TranslationProvider from "./messages/TranslationProvider";
import ProjectDropTarget from "./project/ProjectDropTarget";
import { RouterProvider } from "./router-hooks";
import SessionSettingsProvider from "./settings/session-settings";
import SettingsProvider from "./settings/settings";
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
  : createUSBConnection({
      logging,
      // Jacdac POC: run the whole USB stack (flash, serial, Jacdac pump) in a
      // worker so the timing-sensitive Jacdac poll loop can't be starved.
      worker: new Worker(new URL("./jacdac/usb-worker.ts", import.meta.url), {
        type: "module",
      }),
    });

// Single Jacdac bus wrapping the same shared connection.
const jacdacBus = createJacdacBus(device);

// Jacdac rides the app's normal connect flow: the transport mirrors the shared
// connection's status into the bus (see MicrobitConnectionTransport), so the
// existing "Connect" button brings Jacdac up/down. No separate control.
if (!isMockDeviceMode()) {
  // TEMPORARY (POC step 2): prove discovery in the console until the sidebar
  // surface lands. DEVICE_CHANGE fires on both add and remove.
  jacdacBus.subscribe(DEVICE_CHANGE, () =>
    console.log(
      "[jacdac] devices:",
      jacdacBus
        .devices({ ignoreInfrastructure: true, announced: true })
        .map((d) => d.shortId)
    )
  );

  // TEMPORARY (POC step 3): log roles read from the device's role manager, and
  // expose an identify helper for manual testing until the config UI lands.
  // In the console: jacdacIdentify("left button") blinks that sensor's LED.
  let unsubRoles: (() => void) | undefined;
  const logRoles = () =>
    console.log(
      "[jacdac] roles:",
      (jacdacBus.roleManager?.roles ?? []).map((r) => {
        // Resolve to the friendly shortId so this lines up with the devices log
        // (role.deviceId is the raw 64-bit id; shortId is a hash of it).
        const short = jacdacBus.device(r.deviceId, true)?.shortId;
        return `${r.name}→${short ?? r.deviceId}`;
      })
    );
  jacdacBus.subscribe(ROLE_MANAGER_CHANGE, () => {
    unsubRoles?.();
    unsubRoles = jacdacBus.roleManager?.subscribe(CHANGE, logRoles);
    logRoles();
  });
  (
    window as unknown as { jacdacIdentify?: (name: string) => void }
  ).jacdacIdentify = (name: string) => {
    const role = jacdacBus.roleManager?.roles.find((r) => r.name === name);
    void (role && jacdacBus.device(role.deviceId, true)?.identify());
  };
}

const host = createHost(logging);
const fs = new FileSystem(logging, host, fetchMicroPython);

// If this fails then we retry on access.
fs.initializeInBackground();

const App = () => {
  useEffect(() => {
    logging.event({ type: "boot" });
    device.initialize();
    return () => {
      device.dispose();
    };
  }, []);

  polyfill({
    forceApply: true,
  });

  const deployment = useDeployment();
  const { ConsentProvider } = deployment.compliance;
  return (
    <>
      <VisualViewPortCSSVariables />
      <ChakraProvider theme={deployment.chakraTheme}>
        <LoggingProvider value={logging}>
          <SettingsProvider>
            <SessionSettingsProvider>
              <TranslationProvider>
                <FileSystemProvider value={fs}>
                  <DeviceContextProvider value={device}>
                    <LanguageServerClientProvider>
                      <BeforeUnloadDirtyCheck />
                      <DocumentationProvider>
                        <SearchProvider>
                          <SelectionProvider>
                            <DialogProvider>
                              <RouterProvider>
                                <ConsentProvider>
                                  <ProjectDropTarget>
                                    <ActiveEditorProvider>
                                      <JacdacProvider bus={jacdacBus}>
                                        <JacdacAssignmentsProvider>
                                          <Workbench />
                                        </JacdacAssignmentsProvider>
                                      </JacdacProvider>
                                    </ActiveEditorProvider>
                                  </ProjectDropTarget>
                                </ConsentProvider>
                              </RouterProvider>
                            </DialogProvider>
                          </SelectionProvider>
                        </SearchProvider>
                      </DocumentationProvider>
                    </LanguageServerClientProvider>
                  </DeviceContextProvider>
                </FileSystemProvider>
              </TranslationProvider>
            </SessionSettingsProvider>
          </SettingsProvider>
        </LoggingProvider>
      </ChakraProvider>
    </>
  );
};

export default App;
