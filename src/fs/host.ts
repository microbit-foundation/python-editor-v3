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
} from "./fs";
import { Logging } from "../logging/logging";
import {
  defaultInitialProject,
  PythonProject,
  projectFilesToBase64,
} from "./initial-project";
import { parseMigrationFromUrl } from "./migration";

const messages = {
  type: "pyeditor",
  actions: {
    workspacesync: "workspacesync",
    workspacesave: "workspacesave",
    workspaceloaded: "workspaceloaded",
    importproject: "importproject",
  },
};

export interface Host {
  createInitialProject(): Promise<PythonProject>;
  notifyReady(fs: FileSystem): void;
}

export class DefaultHost implements Host {
  constructor(private url: string = "") {}

  async createInitialProject(): Promise<PythonProject> {
    const migration = parseMigrationFromUrl(this.url);
    if (migration) {
      return projectFilesToBase64({
        files: {
          [MAIN_FILE]: migration.source,
        },
        projectName: migration.meta.name,
      });
    }
    return defaultInitialProject;
  }
  notifyReady(): void {}
}

export class IframeHost implements Host {
  constructor(
    private parent: Window,
    private window: Window,
    private debounceDelay: number = 1_000
  ) {}
  createInitialProject(): Promise<PythonProject> {
    return new Promise((resolve) => {
      this.window.addEventListener("load", () =>
        notifyWorkspaceSync(this.parent)
      );
      this.window.addEventListener("message", (event) => {
        if (
          event?.data.type === messages.type &&
          event?.data.action === messages.actions.workspacesync
        ) {
          const { data } = event;
          if (!Array.isArray(data.projects)) {
            throw new Error(
              "Invalid 'projects' data type. Array should be provided."
            );
          }
          if (data.projects.length < 1) {
            throw new Error(
              "'projects' array should contain at least one item."
            );
          }
          if (typeof data.projects[0] === "string") {
            resolve(
              projectFilesToBase64({
                files: { [MAIN_FILE]: data.projects[0] },
              })
            );
          }
          if (typeof data.projects[0] === "object") {
            resolve(data.projects[0]);
          }
        }
      });
    });
  }
  notifyReady(fs: FileSystem): void {
    const debounceCodeChange = debounce(() => {
      notifyWorkspaceSave(fs, this.parent);
    }, this.debounceDelay);
    fs.addListener(EVENT_PROJECT_UPDATED, debounceCodeChange);
    fs.addListener(EVENT_TEXT_EDIT, debounceCodeChange);

    this.window.addEventListener("message", (event) => {
      if (event?.data.type === messages.type) {
        switch (event.data.action) {
          case messages.actions.importproject:
            return handleImportProject(fs, event.data);
          default:
            throw new Error(`Unsupported action: ${event.data.action}`);
        }
      }
    });

    notifyWorkspaceLoaded(this.parent);
  }
}

export const createHost = (logging: Logging): Host => {
  const iframeHost = getControllerHost(logging);
  if (iframeHost) {
    return new IframeHost(iframeHost, window);
  }
  return new DefaultHost(window.location.href);
};

const getControllerHost = (logging: Logging): Window | undefined => {
  const params = new URLSearchParams(window.location.search);
  const inIframe = window !== window.parent;
  const iframeControllerMode = inIframe && params.get("controller") === "1";
  if (iframeControllerMode) {
    if (window.parent) {
      logging.log("In iframe host mode.");
      return window.parent;
    }
    logging.error(
      "Cannot detect valid host controller despite controller URL parameter."
    );
  }
};

/**
 * Host is sending code to update editor.
 */
const handleImportProject = (fs: FileSystem, data: any) => {
  if (!data.project || typeof data.project === "string") {
    fs.write(MAIN_FILE, data.project, VersionAction.INCREMENT);
  }
  if (!data.project || typeof data.project === "object") {
    fs.replaceWithMultipleFiles(data.project);
  }
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
  const project = await fs.getPythonProject();
  host.postMessage(
    {
      type: messages.type,
      action: messages.actions.workspacesave,
      project,
    },
    "*"
  );
};
