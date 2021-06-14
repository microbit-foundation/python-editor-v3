import { List, ListItem } from "@chakra-ui/layout";
import { saveAs } from "file-saver";
import { InputDialogBody } from "../common/InputDialog";
import { ActionFeedback } from "../common/use-action-feedback";
import { Dialogs } from "../common/use-dialogs";
import {
  ConnectionStatus,
  HexGenerationError,
  MicrobitWebUSBConnection,
  WebUSBError,
} from "../device/device";
import { DownloadData, FileSystem, MAIN_FILE, VersionAction } from "../fs/fs";
import {
  getLowercaseFileExtension,
  isPythonMicrobitModule,
  readFileAsText,
  readFileAsUint8Array,
} from "../fs/fs-util";
import { Logging } from "../logging/logging";
import {
  ClassifiedFileInput,
  FileChange,
  FileInput,
  FileOperation,
} from "./changes";
import ChooseMainScriptQuestion from "./ChooseMainScriptQuestion";
import NewFileNameQuestion from "./NewFileNameQuestion";
import {
  ensurePythonExtension,
  isPythonFile,
  validateNewFilename,
} from "./project-utils";
import { webusbErrorMessages } from "./WebUSBErrorMessages";
import { IntlShape } from "react-intl";

export interface MainScriptChoice {
  main: string | undefined;
}

/**
 * Key actions.
 *
 * These actions all perform their own error handling and
 * give appropriate feedback to the user if they fail.
 *
 * Functions all use arrow functions so they can be directly
 * used as callbacks.
 */
export class ProjectActions {
  constructor(
    private fs: FileSystem,
    private device: MicrobitWebUSBConnection,
    private actionFeedback: ActionFeedback,
    private dialogs: Dialogs,
    private setSelection: (filename: string) => void,
    private intl: IntlShape,
    private logging: Logging
  ) {}

  /**
   * Connect to the device if possible, otherwise show feedback.
   */
  connect = async () => {
    this.logging.event({
      action: "connect",
    });

    if (this.device.status === ConnectionStatus.NOT_SUPPORTED) {
      this.actionFeedback.expectedError({
        title: "WebUSB not supported",
        description: "Download the hex file or try Chrome or Microsoft Edge",
      });
    } else {
      try {
        await this.device.connect();
      } catch (e) {
        this.handleWebUSBError(e);
      }
    }
  };

  /**
   * Disconnect from the device.
   */
  disconnect = async () => {
    this.logging.event({
      action: "disconnect",
    });

    try {
      await this.device.disconnect();
    } catch (e) {
      this.handleWebUSBError(e);
    }
  };

  /**
   * Loads files
   *
   * Replaces the open project if a hex file is opened.
   * No other files may be opened in the same call as a hex file.
   *
   * Uses module marker comments to determine if a Python file
   * is a script or a module. At most one script and any number
   * of modules may be opened together. The existing project is
   * updated.
   *
   * @param file the file from drag and drop or an input element.
   */
  load = async (files: File[]): Promise<void> => {
    this.logging.event({
      action: "load-file",
    });

    if (files.length === 0) {
      throw new Error("Expected to be called with at least one file");
    }

    // Avoid lingering messages related to the previous project.
    // Also makes e2e testing easier.
    this.actionFeedback.closeAll();

    const errorTitle =
      files.length === 1 ? "Cannot load file" : "Cannot load files";

    const extensions = new Set(
      files.map((f) => getLowercaseFileExtension(f.name))
    );
    if (extensions.has("mpy")) {
      this.actionFeedback.expectedError({
        title: errorTitle,
        description:
          "This version of the Python Editor doesn't currently support adding .mpy files.",
      });
    } else if (extensions.has("hex")) {
      if (files.length > 1) {
        this.actionFeedback.expectedError({
          title: errorTitle,
          description:
            "A hex file can only be loaded on its own. It replaces all files in the project.",
        });
      } else {
        // It'd be nice to suppress this (and similar) if it's just the default script.
        if (
          await this.dialogs.confirm({
            header: "Confirm replace project",
            body: "Replace all files with those in the hex?",
            actionLabel: "Replace",
          })
        ) {
          const file = files[0];
          const projectName = file.name.replace(/\.hex$/i, "");
          const hex = await readFileAsText(file);
          try {
            await this.fs.replaceWithHexContents(projectName, hex);
            this.actionFeedback.success({
              title: "Loaded " + file.name,
            });
          } catch (e) {
            this.actionFeedback.expectedError({
              title: errorTitle,
              description: e.message,
              error: e,
            });
          }
        }
      }
    } else {
      const classifiedInputs: ClassifiedFileInput[] = [];
      const hasMainPyFile = files.some((x) => x.name === MAIN_FILE);
      for (const f of files) {
        const content = await readFileAsUint8Array(f);
        const python = isPythonFile(f.name);
        const module = python && isPythonMicrobitModule(content);
        const script = hasMainPyFile ? f.name === MAIN_FILE : python && !module;
        classifiedInputs.push({
          name: f.name,
          script,
          module,
          data: () => Promise.resolve(content),
        });
      }

      const inputs = await this.chooseScriptForMain(classifiedInputs);
      if (inputs) {
        return this.uploadInternal(inputs);
      }
    }
  };

  private async uploadInternal(inputs: ClassifiedFileInput[]) {
    const changes = this.findChanges(inputs);
    try {
      for (const change of changes) {
        const data = await change.data();
        await this.fs.write(change.name, data, VersionAction.INCREMENT);
      }
      this.actionFeedback.success(summarizeChanges(changes));
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  }

  private findChanges(files: FileInput[]): FileChange[] {
    const currentFiles = this.fs.project.files.map((f) => f.name);
    return findChanges(currentFiles, files);
  }

  private async chooseScriptForMain(
    inputs: ClassifiedFileInput[]
  ): Promise<ClassifiedFileInput[] | undefined> {
    const defaultScript = inputs.find((x) => x.script);
    const chosenScript = await this.dialogs.input<MainScriptChoice>({
      header: "Change files?",
      initialValue: {
        main: defaultScript ? defaultScript.name : undefined,
      },
      Body: (props: InputDialogBody<MainScriptChoice>) => (
        <ChooseMainScriptQuestion
          {...props}
          currentFiles={new Set(this.fs.project.files.map((f) => f.name))}
          inputs={inputs}
        />
      ),
      actionLabel: "Confirm",
      size: "lg",
    });
    if (!chosenScript) {
      // User cancelled.
      return undefined;
    }

    return inputs.map((input) => {
      if (chosenScript && chosenScript.main === input.name) {
        return {
          ...input,
          name: "main.py",
        };
      }
      return input;
    });
  }

  /**
   * Flash the device, reporting progress via a dialog.
   */
  flash = async (): Promise<void> => {
    this.logging.event({
      action: "flash",
    });

    if (this.device.status === ConnectionStatus.NOT_SUPPORTED) {
      this.actionFeedback.expectedError({
        title: "WebUSB not supported",
        description: webusbErrorMessages.unavailable,
      });
      return;
    }

    try {
      const progress = (value: number | undefined) => {
        this.dialogs.progress({
          header: "Flashing code",
          progress: value,
        });
      };
      await this.device.flash(this.fs, { partial: true, progress });
    } catch (e) {
      if (e instanceof HexGenerationError) {
        this.actionFeedback.expectedError({
          title: "Failed to build the hex file",
          description: e.message,
        });
      } else {
        this.handleWebUSBError(e);
      }
    }
  };

  /**
   * Trigger a browser download with a universal hex file.
   */
  download = async () => {
    this.logging.event({
      action: "download",
    });

    let download: DownloadData | undefined;
    try {
      download = await this.fs.toHexForDownload();
    } catch (e) {
      this.actionFeedback.expectedError({
        title: "Failed to build the hex file",
        description: e.message,
      });
      return;
    }
    const blob = new Blob([download.intelHex], {
      type: "application/octet-stream",
    });
    saveAs(blob, download.filename);
  };

  /**
   * Download an individual file.
   *
   * @param filename the file to download.
   */
  downloadFile = async (filename: string) => {
    this.logging.event({
      action: "download-file",
    });

    try {
      const content = await this.fs.read(filename);
      const blob = new Blob([content.data], {
        type: "application/octet-stream",
      });
      saveAs(blob, filename);
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  };

  /**
   * Download the main file renamed to match the project.
   *
   * There's some debate as to whether this action is more confusing than helpful
   * but leaving it around for a bit so we can try out different UI arrangements.
   */
  downloadMainFile = async () => {
    this.logging.event({
      action: "download-main-file",
    });

    try {
      const content = await this.fs.read(MAIN_FILE);
      const blob = new Blob([content.data], {
        type: "application/octet-stream",
      });
      const filename = `${this.fs.project.name}.py`;
      saveAs(blob, filename);
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  };

  /**
   * Create a file, prompting the user for the name.
   */
  createFile = async () => {
    this.logging.event({
      action: "create-file",
    });

    const preexistingFiles = new Set(this.fs.project.files.map((f) => f.name));
    const validate = (filename: string) =>
      validateNewFilename(filename, (f) => preexistingFiles.has(f), this.intl);
    const filenameWithoutExtension = await this.dialogs.input<string>({
      header: this.intl.formatMessage({ id: "create-python" }),
      Body: NewFileNameQuestion,
      initialValue: "",
      actionLabel: "Create",
      validate,
      customFocus: true,
    });

    if (filenameWithoutExtension) {
      try {
        const filename = ensurePythonExtension(filenameWithoutExtension);
        await this.fs.write(
          filename,
          "# Your new file!",
          VersionAction.INCREMENT
        );
        this.setSelection(filename);
        // come back later: parameter
        this.actionFeedback.success({
          title: this.intl.formatMessage(
            { id: "created-file" },
            { filename: filename }
          ),
        });
      } catch (e) {
        this.actionFeedback.unexpectedError(e);
      }
    }
  };
  /**
   * Delete a file.
   *
   * @param filename the file to delete.
   */
  deleteFile = async (filename: string) => {
    this.logging.event({
      action: "delete-file",
    });

    try {
      if (
        await this.dialogs.confirm({
          header: "Confirm delete",
          // come back later: parameter
          body: `Permanently delete ${filename}?`,
          actionLabel: "Delete",
        })
      ) {
        await this.fs.remove(filename);
        this.actionFeedback.success({
          // come back later: parameter
          title: `Deleted ${filename}`,
        });
      }
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  };

  /**
   * Set the project name.
   *
   * @param name The new name.
   */
  setProjectName = async (name: string) => {
    this.logging.event({
      action: "set-project-name",
    });

    return this.fs.setProjectName(name);
  };

  private handleWebUSBError(e: any) {
    if (e instanceof WebUSBError) {
      switch (e.code) {
        case "no-device-selected": {
          // User just cancelled the browser dialog so no further response needed.
          return;
        }
        case "device-disconnected": {
          // The UI will already reflect the disconnection.
          return;
        }
        case "update-req":
        case "clear-connect":
        case "timeout-error":
        case "reconnect-microbit": {
          return this.actionFeedback.expectedError(webusbErrorMessages[e.code]);
        }
        default: {
          return this.actionFeedback.unexpectedError(e);
        }
      }
    } else {
      this.actionFeedback.unexpectedError(e);
    }
  }
}

/**
 * Simple analysis of the changes to the current files.
 * The text is simpler than that uses in the load confirmation dialog.
 */
export const findChanges = (
  currentFiles: string[],
  proposedFiles: FileInput[]
): FileChange[] => {
  const current = new Set(currentFiles);
  return proposedFiles.map((f) => ({
    ...f,
    operation: current.has(f.name) ? FileOperation.REPLACE : FileOperation.ADD,
  }));
};

const summarizeChanges = (changes: FileChange[]) => {
  if (changes.length === 1) {
    return { title: summarizeChange(changes[0]) };
  }
  return {
    title: `${changes.length} changes`,
    description: (
      <List>
        {changes.map((c) => (
          <ListItem key={c.name}>{summarizeChange(c)}</ListItem>
        ))}
      </List>
    ),
  };
};

const summarizeChange = (change: FileChange): string => {
  const changeText =
    change.operation === FileOperation.REPLACE ? "Updated" : "Added";
  // come back later: parameter
  return `${changeText} file ${change.name}`;
};
