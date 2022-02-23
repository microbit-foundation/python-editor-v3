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
} from "../fs/fs";

interface ControllerMessaging {
  type: string;
  actions: Record<string, string>;
}

const CONTROLLER_MESSAGING: ControllerMessaging = {
  type: "pyeditor",
  actions: {
    workspacesync: "workspacesync",
    workspacesave: "workspacesave",
    workspaceloaded: "workspaceloaded",
    importproject: "importproject",
  },
};

const getCode = async (fs: FileSystem): Promise<string> => {
  // File hardcoded as main.py temporarily
  const { data } = await fs.read("main.py");
  const code = new TextDecoder().decode(data);
  return code;
};

const setCode = (fs: FileSystem, code: string): void => {
  // File hardcoded as main.py temporarily
  fs.write("main.py", code, VersionAction.INCREMENT);
};

const onCodeChange = (fs: FileSystem, callback: () => void) => {
  fs.addListener(EVENT_PROJECT_UPDATED, callback);
  fs.addListener(EVENT_TEXT_EDIT, callback);
};

const msgEventListener = (event: MessageEvent, fs: FileSystem): void => {
  if (!event.data) return;
  if (event.data.type === CONTROLLER_MESSAGING.type) {
    switch (event.data.action) {
      // Parent is sending code to update editor
      case CONTROLLER_MESSAGING.actions.importproject:
        if (!event.data.project || typeof event.data.project !== "string") {
          throw new Error(
            "Invalid 'project' data type. String should be provided."
          );
        }
        setCode(fs, event.data.project);
        break;
      // Parent is sending initial code for editor
      // Also here we can sync parent data with editor's data
      case CONTROLLER_MESSAGING.actions.workspacesync:
        if (!event.data.projects || !Array.isArray(event.data.projects)) {
          throw new Error(
            "Invalid 'projects' data type. Array should be provided."
          );
        }
        if (event.data.projects.length < 1) {
          throw new Error("'projects' array should contain at least one item.");
        }
        setCode(fs, event.data.projects[0]);
        // Notify parent about editor successfully configured
        window.parent.postMessage(
          {
            type: CONTROLLER_MESSAGING.type,
            action: CONTROLLER_MESSAGING.actions.workspaceloaded,
          },
          "*"
        );
        break;
      default:
        throw new Error("Unsupported action.");
    }
  }
};

export const initEmbeddingController = (
  fs: FileSystem,
  controllerHost: Window
) => {
  window.addEventListener("message", (event) => msgEventListener(event, fs));
  window.addEventListener("load", (e) => {
    controllerHost.postMessage(
      {
        type: CONTROLLER_MESSAGING.type,
        action: CONTROLLER_MESSAGING.actions.workspacesync,
      },
      "*"
    );
  });
  // For classroom we clear the code in the editor
  setCode(fs, " ");
  // Send code to the controller in real time (with a 1s debounce)
  const debounceCodeChange = debounce(async () => {
    const code = await getCode(fs);
    controllerHost.postMessage(
      {
        type: CONTROLLER_MESSAGING.type,
        action: CONTROLLER_MESSAGING.actions.workspacesave,
        project: code,
      },
      "*"
    );
  }, 1000);
  onCodeChange(fs, async () => {
    debounceCodeChange();
  });
};

export const getControllerHost = () => {
  const params = new URLSearchParams(window.location.search);
  const inIframe = window !== window.parent;
  const iframeControllerMode = inIframe && params.get("controller") === "1";
  if (iframeControllerMode) {
    // Detect the host controller to send our messages
    if (iframeControllerMode && window.parent) {
      // Classroom wraps the editor in an iframe
      return window.parent;
    } else {
      console.error("Cannot detect valid host controller.");
    }
  }
};
