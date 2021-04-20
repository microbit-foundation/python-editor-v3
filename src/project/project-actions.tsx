import { List, ListItem } from "@chakra-ui/layout";
import { saveAs } from "file-saver";
import Separate, { br } from "../common/Separate";
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
} from "../fs/fs-util";
import { Logging } from "../logging/logging";
import translation from "../translation";
import {
  ensurePythonExtension,
  isPythonFile,
  validateNewFilename,
} from "./project-utils";
import ChooseMainScriptQuestion from "./ChooseMainScriptQuestion";
import { FileChange, FileInput, FileOperation, findChanges } from "./changes";
import NewFileNameQuestion from "./NewFileNameQuestion";
import { InputDialogBody } from "../common/InputDialog";

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
        description: translation.load["mpy-warning"],
      });
    } else if (extensions.has("hex")) {
      if (files.length > 1) {
        this.actionFeedback.expectedError({
          title: errorTitle,
          description: "Can only load one hex file at a time.",
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
      const candidateScripts: FileInput[] = [];
      const otherFiles: FileInput[] = [];
      for (const f of files) {
        const content = await readFileAsText(f);
        const isOther =
          !isPythonFile(f.name) || isPythonMicrobitModule(content);
        // if not module check {if it is a script we want to replace main.py with, else add it to modules}?
        (isOther ? otherFiles : candidateScripts).push({
          name: f.name,
          data: () => Promise.resolve(content),
        });
      }

      const inputs = await this.chooseScriptForMain(
        candidateScripts,
        otherFiles
      );
      return this.uploadInternal(inputs);
    }
  };

  private async uploadInternal(inputs: FileInput[]) {
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
    candidateScripts: FileInput[],
    otherFiles: FileInput[]
  ): Promise<FileInput[]> {
    const chosenScript = await this.dialogs.input<string | undefined>({
      header: "Confirm file changes",
      initialValue:
        candidateScripts.length > 0 ? candidateScripts[0].name : undefined,
      Body: (props: InputDialogBody<string | undefined>) => (
        <ChooseMainScriptQuestion
          {...props}
          currentFiles={this.fs.project.files.map((f) => f.name)}
          candidateScripts={candidateScripts}
          otherFiles={otherFiles}
        />
      ),
      actionLabel: "Confirm",
      validate: () => undefined,
    });

    const appliedChoice = candidateScripts.map((script) => {
      if (chosenScript && chosenScript === script.name) {
        return {
          ...script,
          name: "main.py",
        };
      }
      return script;
    });
    return [...appliedChoice, ...otherFiles];
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
        description: "Download the hex file or try Chrome or Microsoft Edge",
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
      validateNewFilename(filename, (f) => preexistingFiles.has(f));
    const filenameWithoutExtension = await this.dialogs.input<string>({
      header: "Create a new Python file",
      Body: NewFileNameQuestion,
      initialValue: "",
      actionLabel: "Create",
      validate,
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
        this.actionFeedback.success({
          title: `Created ${filename}`,
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
          body: `Permanently delete ${filename}?`,
          actionLabel: "Delete",
        })
      ) {
        await this.fs.remove(filename);
        this.actionFeedback.success({
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
      this.actionFeedback.expectedError({
        title: e.title,
        description: (
          <Separate separator={br}>
            {[e.message, e.description].filter(Boolean)}
          </Separate>
        ),
      });
    } else {
      this.actionFeedback.unexpectedError(e);
    }
  }
}

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
  return `${changeText} file ${change.name}`;
};
