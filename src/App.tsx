/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SharedUIProvider, ToastProvider } from "@microbit/ui";
import { polyfill } from "mobile-drag-drop";
import { useEffect, useMemo } from "react";
import "./App.css";
import { DialogProvider } from "./common/use-dialogs";
import VisualViewPortCSSVariables from "./common/VisualViewportCSSVariables";
import { deployment, useDeployment } from "./deployment";
import { ConnectionStatusChange } from "@microbit/microbit-connection";
import {
  MicrobitUSBConnection,
  createUSBConnection,
} from "@microbit/microbit-connection/usb";
import { DeviceContextProvider } from "./device/device-hooks";
import { MockDeviceConnection } from "./device/mock";
import DocumentationProvider from "./documentation/documentation-hooks";
import SearchProvider from "./documentation/search/search-hooks";
import { ActiveEditorProvider } from "./editor/active-editor-hooks";
import { FileSystem } from "./fs/fs";
import { FileSystemProvider } from "./fs/fs-hooks";
import { createHost, IframeHost } from "./fs/host";
import { IframeModeProvider } from "./iframe-mode-hooks";
import { fetchMicroPython } from "./micropython/micropython";
import { LanguageServerClientProvider } from "./language-server/language-server-hooks";
import { logDeviceStatusChange } from "./logging/analytics";
import { LoggingProvider } from "./logging/logging-hooks";
import TranslationProvider from "./messages/TranslationProvider";
import ProjectDropTarget from "./project/ProjectDropTarget";
import { RouterProvider } from "react-router/dom";
import { createRouter } from "./router";
import SessionSettingsProvider from "./settings/session-settings";
import SettingsProvider from "./settings/settings";
import BeforeUnloadDirtyCheck from "./workbench/BeforeUnloadDirtyCheck";
import { SelectionProvider } from "./workbench/use-selection";

const isMockDeviceMode = () =>
  // We use a cookie set from the e2e tests. Avoids having separate test and live builds.
  Boolean(
    document.cookie.split("; ").find((row) => row.startsWith("mockDevice="))
  );

const logging = deployment.logging;
const device: MicrobitUSBConnection = isMockDeviceMode()
  ? new MockDeviceConnection()
  : createUSBConnection({ logging });

const host = createHost(logging);
const iframeMode = host instanceof IframeHost;
const fs = new FileSystem(logging, host, fetchMicroPython);

// If this fails then we retry on access.
fs.initializeInBackground();

const App = () => {
  useEffect(() => {
    logging.setUserProperty(
      "webusb_available",
      "usb" in navigator ? "yes" : "no"
    );
    const statusListener = (event: ConnectionStatusChange) =>
      logDeviceStatusChange(logging, event);
    device.addEventListener("status", statusListener);
    device.initialize();
    return () => {
      device.removeEventListener("status", statusListener);
      device.dispose();
    };
  }, []);

  polyfill({
    forceApply: true,
  });

  const deployment = useDeployment();
  const { ConsentProvider } = deployment.compliance;
  const router = useMemo(() => createRouter({ iframe: iframeMode }), []);
  return (
    <>
      <VisualViewPortCSSVariables />
      <LoggingProvider value={logging}>
        <IframeModeProvider value={iframeMode}>
          <SettingsProvider>
            <SessionSettingsProvider>
              <TranslationProvider>
                {/* Inside TranslationProvider: SharedUIProvider passes the app
                    locale to react-aria for its built-in strings, and the
                    toast region's close label and status announcements are
                    react-intl messages. */}
                <SharedUIProvider>
                  <ToastProvider />
                  <FileSystemProvider value={fs}>
                    <DeviceContextProvider value={device}>
                      <LanguageServerClientProvider>
                        <BeforeUnloadDirtyCheck />
                        <DocumentationProvider>
                          <SearchProvider>
                            <SelectionProvider>
                              <DialogProvider>
                                <ConsentProvider>
                                  <ProjectDropTarget>
                                    <ActiveEditorProvider>
                                      <RouterProvider router={router} />
                                    </ActiveEditorProvider>
                                  </ProjectDropTarget>
                                </ConsentProvider>
                              </DialogProvider>
                            </SelectionProvider>
                          </SearchProvider>
                        </DocumentationProvider>
                      </LanguageServerClientProvider>
                    </DeviceContextProvider>
                  </FileSystemProvider>
                </SharedUIProvider>
              </TranslationProvider>
            </SessionSettingsProvider>
          </SettingsProvider>
        </IframeModeProvider>
      </LoggingProvider>
    </>
  );
};

export default App;
