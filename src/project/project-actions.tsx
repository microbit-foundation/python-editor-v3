import { List, ListItem } from "@chakra-ui/layout";
import { saveAs } from "file-saver";
import Separate, { br } from "../common/Separate";
import { ActionFeedback } from "../common/use-action-feedback";
import { Dialogs } from "../common/use-dialogs";
import { BoardId } from "../device/board-id";
import {
  ConnectionStatus,
  MicrobitWebUSBConnection,
  WebUSBError,
} from "../device/device";
import { DownloadData, FileSystem } from "../fs/fs";
import {
  getLowercaseFileExtension,
  isPythonMicrobitModule,
  readFileAsText,
  readFileAsUint8Array,
} from "../fs/fs-util";
import { VersionAction } from "../fs/storage";
import { Logging } from "../logging/logging";
import translation from "../translation";
import { ensurePythonExtension, validateNewFilename } from "./project-utils";
import ReplaceFilesQuestion from "./ReplaceFilesQuestion";

class HexGenerationError extends Error {}

enum FileOperation {
  REPLACE,
  ADD,
}

interface FileInput {
  name: string;
  data: () => Promise<Uint8Array> | Promise<string>;
}

interface FileChange extends FileInput {
  operation: FileOperation;
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
    } else if (hasExtensionsNotSupportedForLoad(extensions)) {
      this.actionFeedback.expectedError({
        title: errorTitle,
        description: translation.load["extension-warning"],
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
      const scripts: FileInput[] = [];
      const modules: FileInput[] = [];
      for (const f of files) {
        const content = await readFileAsText(f);
        const isModule = isPythonMicrobitModule(content);
        (isModule ? modules : scripts).push({
          name: f.name,
          data: () => Promise.resolve(content),
        });
      }

      // We map scripts to main.py, so there can only be one.
      // It's fine if there are none -- we'll just load the modules.
      if (scripts.length > 1) {
        this.actionFeedback.expectedError({
          title: errorTitle,
          description: "Cannot load multiple main Python scripts",
        });
      } else {
        const inputs: FileInput[] = [];
        if (scripts.length > 0) {
          inputs.push({
            name: "main.py",
            data: scripts[0].data,
          });
        }
        inputs.push(...modules);
        return this.uploadInternal(inputs);
      }
    }
  };

  /**
   * A straightforward way to upload files into the file system.
   *
   * Files use their own names.
   *
   * @param files One or more files.
   */
  upload = async (files: File[]): Promise<void> => {
    this.logging.event({
      action: "upload-file",
    });

    if (files.length === 0) {
      throw new Error("Expected to be called with at least one file");
    }
    return this.uploadInternal(
      files.map((f) => ({
        name: f.name,
        data: () => readFileAsUint8Array(f),
      }))
    );
  };

  private async uploadInternal(inputs: FileInput[]) {
    const changes = this.findChanges(inputs);
    if (await this.confirmReplacements(changes)) {
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
  }

  private findChanges(files: FileInput[]): FileChange[] {
    const current = new Set(this.fs.project.files.map((f) => f.name));
    return files.map((f) => ({
      ...f,
      operation: current.has(f.name)
        ? FileOperation.REPLACE
        : FileOperation.ADD,
    }));
  }

  private async confirmReplacements(changes: FileChange[]): Promise<boolean> {
    const replacements = changes.filter(
      (c) => c.operation === FileOperation.REPLACE
    );
    if (replacements.length > 0) {
      return this.dialogs.confirm({
        header: "Confirm replacing files",
        body: <ReplaceFilesQuestion files={replacements.map((c) => c.name)} />,
        actionLabel: "Replace",
      });
    }
    return true;
  }

  /**
   * Flash the device.
   *
   * @param progress Progress handler called with 0..1 then undefined.
   */
  flash = async (
    progress: (value: number | undefined) => void
  ): Promise<void> => {
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

    const dataSource = async (boardId: BoardId) => {
      try {
        return await this.fs.toHexForFlash(boardId);
      } catch (e) {
        throw new HexGenerationError(e.message);
      }
    };

    try {
      await this.device.flash(dataSource, { partial: true, progress });
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
   * Create a file, prompting the user for the name.
   */
  createFile = async () => {
    this.logging.event({
      action: "create-file",
    });

    const preexistingFiles = new Set(this.fs.project.files.map((f) => f.name));
    const validate = (filename: string) =>
      validateNewFilename(filename, (f) => preexistingFiles.has(f));
    const filenameWithoutExtension = await this.dialogs.input({
      header: "Create a new Python file",
      body: null,
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

/**
 * Check for unsupported extensions.
 *
 * Note that we allow all files via the upload action, but the main
 * load action expects hex files or Python files.
 *
 * `undefined` in the set represents a file or files with an
 * unidentifiable extension.
 *
 * @param extensions The extensions/
 */
const hasExtensionsNotSupportedForLoad = (
  extensions: Set<string | undefined>
): boolean => {
  const copy = new Set(extensions);
  copy.delete("py");
  copy.delete("hex");
  return copy.size > 0;
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
  return `${changeText} file ${change.name}`;
};
