/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, List, ListItem } from "@chakra-ui/layout";
import { Text, VStack } from "@chakra-ui/react";
import { saveAs } from "file-saver";
import { ReactNode } from "react";
import { FormattedMessage, IntlShape } from "react-intl";
import { InputDialogBody } from "../common/InputDialog";
import { ActionFeedback } from "../common/use-action-feedback";
import { Dialogs } from "../common/use-dialogs";
import {
  ConnectionStatus,
  DeviceConnection,
  HexGenerationError,
  WebUSBError,
  WebUSBErrorCode,
} from "../device/device";
import { FileSystem, MAIN_FILE, Statistics, VersionAction } from "../fs/fs";
import {
  getLowercaseFileExtension,
  isPythonMicrobitModule,
  readFileAsText,
  readFileAsUint8Array,
} from "../fs/fs-util";
import { LanguageServerClient } from "../language-server/client";
import { Logging } from "../logging/logging";
import { WorkbenchSelection } from "../workbench/use-selection";
import {
  ClassifiedFileInput,
  FileChange,
  FileInput,
  FileOperation,
} from "./changes";
import ChooseMainScriptQuestion from "./ChooseMainScriptQuestion";
import NewFileNameQuestion from "./NewFileNameQuestion";
import { DefaultedProject } from "./project-hooks";
import {
  ensurePythonExtension,
  isPythonFile,
  validateNewFilename,
} from "./project-utils";

/**
 * Distinguishes the different ways to trigger the load action.
 */
export type LoadType = "drop-load" | "file-upload";

export interface MainScriptChoice {
  main: string | undefined;
}

interface ProjectStatistics extends Statistics {
  errorCount: number;
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
    private device: DeviceConnection,
    private actionFeedback: ActionFeedback,
    private dialogs: Dialogs,
    private setSelection: (selection: WorkbenchSelection) => void,
    private intl: IntlShape,
    private logging: Logging,
    private client: LanguageServerClient | undefined
  ) {}

  private get project(): DefaultedProject {
    return defaultedProject(this.fs, this.intl);
  }

  /**
   * Connect to the device if possible, otherwise show feedback.
   */
  connect = async () => {
    this.logging.event({
      type: "connect",
    });

    if (this.device.status === ConnectionStatus.NOT_SUPPORTED) {
      this.actionFeedback.expectedError({
        title: this.intl.formatMessage({ id: "webusb-not-supported" }),
        description: this.intl.formatMessage({ id: "webusb-download-instead" }),
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
      type: "disconnect",
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
  load = async (
    files: File[],
    type: LoadType = "file-upload"
  ): Promise<void> => {
    this.logging.event({
      type,
      detail: files,
    });

    if (files.length === 0) {
      throw new Error("Expected to be called with at least one file");
    }

    // Avoid lingering messages related to the previous project.
    // Also makes e2e testing easier.
    this.actionFeedback.closeAll();

    const errorTitle = this.intl.formatMessage(
      { id: "load-error-title" },
      {
        fileCount: files.length,
      }
    );
    const extensions = new Set(
      files.map((f) => getLowercaseFileExtension(f.name))
    );
    if (extensions.has("mpy")) {
      this.actionFeedback.expectedError({
        title: errorTitle,
        description: this.intl.formatMessage({ id: "load-error-mpy" }),
      });
    } else if (extensions.has("hex")) {
      if (files.length > 1) {
        this.actionFeedback.expectedError({
          title: errorTitle,
          description: this.intl.formatMessage({ id: "load-error-mixed" }),
        });
      } else {
        // It'd be nice to suppress this (and similar) if it's just the default script.
        if (
          await this.dialogs.confirm({
            header: this.intl.formatMessage({ id: "confirm-replace-title" }),
            body: this.intl.formatMessage({ id: "confirm-replace-body" }),
            actionLabel: this.intl.formatMessage({
              id: "replace-action-label",
            }),
          })
        ) {
          const file = files[0];
          const projectName = file.name.replace(/\.hex$/i, "");
          const hex = await readFileAsText(file);
          try {
            await this.fs.replaceWithHexContents(projectName, hex);
            this.actionFeedback.success({
              title: this.intl.formatMessage(
                { id: "loaded-file-feedback" },
                { filename: file.name }
              ),
            });
          } catch (e: any) {
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
      this.actionFeedback.success(this.summarizeChanges(changes));
    } catch (e: any) {
      this.actionFeedback.unexpectedError(e);
    }
  }

  private findChanges(files: FileInput[]): FileChange[] {
    const currentFiles = this.project.files.map((f) => f.name);
    const current = new Set(currentFiles);
    return files.map((f) => ({
      ...f,
      operation: current.has(f.name)
        ? FileOperation.REPLACE
        : FileOperation.ADD,
    }));
  }

  private async chooseScriptForMain(
    inputs: ClassifiedFileInput[]
  ): Promise<ClassifiedFileInput[] | undefined> {
    const defaultScript = inputs.find((x) => x.script);
    const chosenScript = await this.dialogs.input<MainScriptChoice>({
      header: this.intl.formatMessage({ id: "change-files" }),
      initialValue: {
        main: defaultScript ? defaultScript.name : undefined,
      },
      Body: (props: InputDialogBody<MainScriptChoice>) => (
        <ChooseMainScriptQuestion
          {...props}
          currentFiles={new Set(this.project.files.map((f) => f.name))}
          inputs={inputs}
        />
      ),
      actionLabel: this.intl.formatMessage({ id: "confirm-action" }),
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
      type: "flash",
      detail: await this.projectStats(),
    });

    if (this.device.status === ConnectionStatus.NOT_SUPPORTED) {
      this.webusbNotSupportedError();
      return;
    }

    try {
      const flashingCode = this.intl.formatMessage({ id: "flashing-code" });
      const flashingMicroPython = this.intl.formatMessage({
        id: "flashing-micropython",
      });
      const firstFlashNotice = (
        <Text fontSize="lg">
          <FormattedMessage id="flashing-full-flash-detail" />
        </Text>
      );
      const progress = (value: number | undefined, partial: boolean) => {
        this.dialogs.progress({
          header: partial ? flashingCode : flashingMicroPython,
          body: partial ? undefined : firstFlashNotice,
          progress: value,
        });
      };
      await this.device.flash(this.fs, { partial: true, progress });
    } catch (e) {
      if (e instanceof HexGenerationError) {
        this.actionFeedback.expectedError({
          title: this.intl.formatMessage({ id: "failed-to-build-hex" }),
          // Not translated, see https://github.com/microbit-foundation/python-editor-next/issues/159
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
      type: "download",
      detail: await this.projectStats(),
    });

    let download: string | undefined;
    try {
      download = await this.fs.toHexForDownload();
    } catch (e: any) {
      this.actionFeedback.expectedError({
        title: this.intl.formatMessage({ id: "failed-to-build-hex" }),
        // Not translated, see https://github.com/microbit-foundation/python-editor-next/issues/159
        description: e.message,
      });
      return;
    }
    const blob = new Blob([download], {
      type: "application/octet-stream",
    });
    saveAs(blob, this.project.name + ".hex");
  };

  /**
   * Download an individual file.
   *
   * @param filename the file to download.
   */
  downloadFile = async (filename: string) => {
    this.logging.event({
      type: "download-file",
    });

    try {
      const content = await this.fs.read(filename);
      const blob = new Blob([content.data], {
        type: "application/octet-stream",
      });
      saveAs(blob, filename);
    } catch (e: any) {
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
      type: "download-main-file",
    });

    try {
      const content = await this.fs.read(MAIN_FILE);
      const blob = new Blob([content.data], {
        type: "application/octet-stream",
      });
      const filename = `${this.project.name}.py`;
      saveAs(blob, filename);
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  };

  /**
   * Create a file, prompting the user for the name.
   */
  addFile = async () => {
    const preexistingFiles = new Set(this.project.files.map((f) => f.name));
    const validate = (filename: string) =>
      validateNewFilename(filename, (f) => preexistingFiles.has(f), this.intl);
    const filenameWithoutExtension = await this.dialogs.input<string>({
      header: this.intl.formatMessage({ id: "add-python" }),
      Body: NewFileNameQuestion,
      initialValue: "",
      actionLabel: this.intl.formatMessage({ id: "add-action" }),
      validate,
      customFocus: true,
    });

    if (filenameWithoutExtension) {
      this.logging.event({
        type: "add-file",
      });
      try {
        const filename = ensurePythonExtension(filenameWithoutExtension);
        await this.fs.write(
          filename,
          "# Your new file!",
          VersionAction.INCREMENT
        );
        this.setSelection({ file: filename, location: { line: undefined } });
        this.actionFeedback.success({
          title: this.intl.formatMessage({ id: "added-file" }, { filename }),
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
      type: "delete-file",
    });

    try {
      if (
        await this.dialogs.confirm({
          header: this.intl.formatMessage({ id: "confirm-delete" }),
          body: this.intl.formatMessage(
            { id: "permanently-delete" },
            { filename }
          ),
          actionLabel: this.intl.formatMessage({ id: "delete-action" }),
        })
      ) {
        await this.fs.remove(filename);
        this.actionFeedback.success({
          title: this.intl.formatMessage({ id: "deleted-file" }, { filename }),
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
      type: "set-project-name",
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
          return this.actionFeedback.expectedError(
            this.webusbErrorMessage(e.code)
          );
        }
        default: {
          return this.actionFeedback.unexpectedError(e);
        }
      }
    } else {
      this.actionFeedback.unexpectedError(e);
    }
  }

  private webusbNotSupportedError(): void {
    this.actionFeedback.expectedError({
      title: this.intl.formatMessage({ id: "webusb-error-default-title" }),
      description: (
        <VStack alignItems="stretch" mt={1}>
          <p>{this.intl.formatMessage({ id: "webusb-why-use" })}</p>
          <p>{this.intl.formatMessage({ id: "webusb-not-supported" })}</p>
        </VStack>
      ),
    });
  }

  private webusbErrorMessage(code: WebUSBErrorCode) {
    switch (code) {
      case "update-req":
        return {
          title: this.intl.formatMessage({
            id: "webusb-error-update-req-title",
          }),
          description: (
            <span>
              {this.intl.formatMessage(
                {
                  id: "webusb-error-update-req-description",
                },
                {
                  link: (chunks: ReactNode) => (
                    <Link
                      target="_blank"
                      rel="noreferrer"
                      href="https://microbit.org/firmware/"
                      textDecoration="underline"
                    >
                      {chunks}
                    </Link>
                  ),
                }
              )}
            </span>
          ),
        };
      case "clear-connect":
        return {
          title: this.intl.formatMessage({
            id: "webusb-error-clear-connect-title",
          }),
          description: (
            <VStack alignItems="stretch" mt={1}>
              <p>
                {this.intl.formatMessage({
                  id: "webusb-error-clear-connect-description-1",
                })}
              </p>
              <p>
                {this.intl.formatMessage({
                  id: "webusb-error-clear-connect-description-2",
                })}
              </p>
            </VStack>
          ),
        };
      case "reconnect-microbit":
        return {
          title: this.intl.formatMessage({ id: "webusb-error-default-title" }),
          description: this.intl.formatMessage({
            id: "webusb-error-reconnect-microbit-description",
          }),
        };
      case "timeout-error":
        return {
          title: this.intl.formatMessage({ id: "timeout-error-title" }),
          description: this.intl.formatMessage({
            id: "timeout-error-description",
          }),
        };
      default:
        throw new Error("Unknown code");
    }
  }

  private async projectStats(): Promise<ProjectStatistics> {
    return {
      ...(await this.fs.statistics()),
      errorCount: this.client?.errorCount() ?? 0,
    };
  }

  summarizeChanges = (changes: FileChange[]) => {
    if (changes.length === 1) {
      return { title: this.summarizeChange(changes[0]) };
    }
    return {
      title: `${changes.length} changes`,
      description: (
        <List>
          {changes.map((c) => (
            <ListItem key={c.name}>{this.summarizeChange(c)}</ListItem>
          ))}
        </List>
      ),
    };
  };

  idForChangeType = (changeType: FileOperation): string => {
    return changeType === FileOperation.REPLACE
      ? "updated-change"
      : "added-change";
  };

  summarizeChange = (change: FileChange): string => {
    const translationID = this.idForChangeType(change.operation);
    return this.intl.formatMessage(
      { id: translationID },
      { changeName: change.name }
    );
  };
}

export const defaultedProject = (
  fs: FileSystem,
  intl: IntlShape
): DefaultedProject => {
  return {
    ...fs.project,
    // We do this here so the default changes when the language does.
    name: fs.project.name ?? intl.formatMessage({ id: "untitled-project" }),
  };
};
