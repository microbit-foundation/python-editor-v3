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
    loadhex: "loadhex",
    loadfile: "loadfile",
    savefile: "savefile",
    flashhex: "flashhex",
    // mobilemode: "mobilemode",
  },
};

interface EditorActions {
  getCode: () => Promise<string>;
  setCode: (project: string) => void;
  onCodeChange: (callback: () => void) => void;
  loadHex: (filename: string, filestring: string) => void;
  loadFileToFs: (filename: string, filestring: string) => void;
  //   setMobileEditor: (hostFlashHex: string, hostSaveFile: string) => void;
}

// TODO: complete stubbed methods.
const editorActions = (fs: FileSystem): EditorActions => ({
  getCode: async () => {
    // File hardcoded as main.py temporarily
    const { data } = await fs.read("main.py");
    const code = new TextDecoder().decode(data);
    return code;
  },
  setCode: (code: string) => {
    // File hardcoded as main.py temporarily
    fs.write("main.py", code, VersionAction.INCREMENT);
  },
  // Stub implementation.
  onCodeChange: (callback) => {
    fs.addListener(EVENT_PROJECT_UPDATED, callback);
    fs.addListener(EVENT_TEXT_EDIT, callback);
  },
  // Stub implementation.
  loadHex: (filename: string, filestring: string) =>
    console.log("load hex: ", filename),
  // Stub implementation.
  loadFileToFs: (filename: string, filestring: string) =>
    console.log("load file to fs: ", filename),
  //   setMobileEditor: (hostFlashHex: string, hostSaveFile: string) =>
  //     console.log("set mobile editor"),
});

class EmbeddingController {
  constructor(
    private editorActions: EditorActions,
    private controllerHost: Window,
    private msgEventListener: undefined | ((Event: MessageEvent) => void)
  ) {}

  initialise = () => {
    if (this.msgEventListener) {
      window.addEventListener("message", this.msgEventListener, false);
    } else {
      throw new Error("The editor controller setup() has not been configured.");
    }
    window.addEventListener("load", (e) => {
      this.controllerHost.postMessage(
        {
          type: CONTROLLER_MESSAGING.type,
          action: CONTROLLER_MESSAGING.actions.workspacesync,
        },
        "*"
      );
    });
    console.log("Configuring iframe controller.");
    // For classroom we clear the code in the editor
    this.editorActions.setCode(" ");
    // Send code to the controller in real time (with a 1s debounce)
    const debounceCodeChange = debounce(async () => {
      const code = await this.editorActions.getCode();
      this.controllerHost.postMessage(
        {
          type: CONTROLLER_MESSAGING.type,
          action: CONTROLLER_MESSAGING.actions.workspacesave,
          project: code,
        },
        "*"
      );
    }, 1000);
    this.editorActions.onCodeChange(async () => {
      debounceCodeChange();
    });
  };

  setup = () => {
    this.msgEventListener = (event: MessageEvent): void => {
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
            this.editorActions.setCode(event.data.project);
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
              throw new Error(
                "'projects' array should contain at least one item."
              );
            }
            this.editorActions.setCode(event.data.projects[0]);
            // Notify parent about editor successfully configured
            window.parent.postMessage(
              {
                type: CONTROLLER_MESSAGING.type,
                action: CONTROLLER_MESSAGING.actions.workspaceloaded,
              },
              "*"
            );
            break;

          // Parent is sending HEX file
          case CONTROLLER_MESSAGING.actions.loadhex:
            if (
              !event.data.filename ||
              typeof event.data.filename !== "string"
            ) {
              throw new Error(
                "Invalid 'filename' data type. String should be provided."
              );
            }
            if (
              !event.data.filestring ||
              typeof event.data.filestring !== "string"
            ) {
              throw new Error(
                "Invalid 'filename' data type. String should be provided."
              );
            }
            this.editorActions.loadHex(
              event.data.filename,
              event.data.filestring
            );
            break;

          // Parent is sending file for filesystem
          case CONTROLLER_MESSAGING.actions.loadfile:
            if (
              !event.data.filename ||
              typeof event.data.filename !== "string"
            ) {
              throw new Error(
                "Invalid 'filename' data type. String should be provided."
              );
            }
            if (
              !event.data.filestring ||
              typeof event.data.filestring !== "string"
            ) {
              throw new Error(
                "Invalid 'filestring' data type. String should be provided."
              );
            }
            this.editorActions.loadFileToFs(
              event.data.filename,
              event.data.filestring
            );
            break;

          // Parent is requesting postMessage downloads
          // case CONTROLLER_MESSAGING.actions.mobilemode:
          //   this.editorActions.setMobileEditor(hostFlashHex, hostSaveFile);
          //   break;
          default:
            throw new Error("Unsupported action.");
        }
      }
    };
  };
}

export const editorIsEmbedded = () => {
  const params = new URLSearchParams(window.location.search);
  const inIframe = window !== window.parent;
  const iframeControllerMode = inIframe && params.get("controller") === "1";
  // const appControllerMode = qs.mobileApp === '1';

  if (iframeControllerMode) {
    // Detect the host controller to send our messages
    if (iframeControllerMode && window.parent) {
      // Classroom wraps the editor in an iframe
      return true;
    } else {
      console.error("Cannot detect valid host controller.");
    }
  }
};

export const initEmbeddingController = (fs: FileSystem) => {
  const embeddingController = new EmbeddingController(
    editorActions(fs),
    window.parent,
    undefined
  );
  embeddingController.setup();
  embeddingController.initialise();
};
