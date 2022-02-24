/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import debounce from "lodash.debounce";
import {
  FileSystem,
  VersionAction,
  EVENT_PROJECT_UPDATED,
  EVENT_TEXT_EDIT,
  MAIN_FILE,
} from "../fs/fs";
import { Logging } from "../logging/logging";

const messages = {
  type: "pyeditor",
  actions: {
    workspacesync: "workspacesync",
    workspacesave: "workspacesave",
    workspaceloaded: "workspaceloaded",
    importproject: "importproject",
  },
};

export const initializeEmbeddingController = (
  logging: Logging,
  fs: FileSystem
) => {
  const host = getControllerHost(logging);
  if (!host) {
    return;
  }
  window.addEventListener("message", (event) => {
    if (event?.data.type === messages.type) {
      switch (event.data.action) {
        case messages.actions.importproject:
          return handleImportProject(fs, event.data);
        case messages.actions.workspacesync:
          return handleWorkspaceSync(fs, host, event.data);
        default:
          throw new Error(`Unsupported action: ${event.data.action}`);
      }
    }
  });
  window.addEventListener("load", () => notifyWorkspaceSync(host));

  const debounceCodeChange = debounce(() => {
    notifyWorkspaceSave(fs, host);
  }, 1000);
  fs.addListener(EVENT_PROJECT_UPDATED, debounceCodeChange);
  fs.addListener(EVENT_TEXT_EDIT, debounceCodeChange);
};

const getControllerHost = (logging: Logging): Window | undefined => {
  const params = new URLSearchParams(window.location.search);
  const inIframe = window !== window.parent;
  const iframeControllerMode = inIframe && params.get("controller") === "1";
  if (iframeControllerMode) {
    if (window.parent) {
      logging.log("In iframe embedded mode.");
      return window.parent;
    }
    logging.error(
      "Cannot detect valid host controller despite controller URL parameter."
    );
  }
};

const setMainCode = (fs: FileSystem, code: string): void => {
  fs.write(MAIN_FILE, code, VersionAction.INCREMENT);
};

/**
 * Host is initializing the code.
 */
const handleWorkspaceSync = (fs: FileSystem, host: Window, data: any) => {
  if (!data.projects || !Array.isArray(data.projects)) {
    throw new Error("Invalid 'projects' data type. Array should be provided.");
  }
  if (data.projects.length < 1) {
    throw new Error("'projects' array should contain at least one item.");
  }
  setMainCode(fs, data.projects[0]);
  notifyWorkspaceLoaded(host);
};

/**
 * Host is sending code to update editor.
 */
const handleImportProject = (fs: FileSystem, data: any) => {
  if (!data.project || typeof data.project !== "string") {
    throw new Error("Invalid 'project' data type. String should be provided.");
  }
  setMainCode(fs, data.project);
};

/**
 * Notifies the host we're ready to sync.
 * The host will reply with a `workspacesync`.
 */
const notifyWorkspaceSync = (host: Window) => {
  host.postMessage(
    {
      type: messages.type,
      action: messages.actions.workspacesync,
    },
    "*"
  );
};

/**
 * Notifies the host that 'workspacesync' was successful.
 */
const notifyWorkspaceLoaded = (host: Window) => {
  host.postMessage(
    {
      type: messages.type,
      action: messages.actions.workspaceloaded,
    },
    "*"
  );
};

/**
 * Sends the editor code to the host.
 *
 * We do this periodically when the code changes.
 */
const notifyWorkspaceSave = async (fs: FileSystem, host: Window) => {
  const { data } = await fs.read(MAIN_FILE);
  const code = new TextDecoder().decode(data);
  host.postMessage(
    {
      type: messages.type,
      action: messages.actions.workspacesave,
      project: code,
    },
    "*"
  );
};
