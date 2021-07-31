/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, List, ListItem } from "@chakra-ui/layout";
import { VStack } from "@chakra-ui/react";
import { saveAs } from "file-saver";
import { ReactNode } from "react";
import { IntlShape } from "react-intl";
import { InputDialogBody } from "../common/InputDialog";
import { ActionFeedback } from "../common/use-action-feedback";
import { Dialogs } from "../common/use-dialogs";
import {
  ConnectionStatus,
  HexGenerationError,
  MicrobitWebUSBConnection,
  WebUSBError,
  WebUSBErrorCode,
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
import { EVENT_SERIAL_DATA, EVENT_SERIAL_RESET } from "../device/device";

/**
 * Distinguishes the different ways to trigger the load action.
 */
export type LoadType = "drop-load" | "file-upload";

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
      this.actionFeedback.success(this.summarizeChanges(changes));
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  }

  private findChanges(files: FileInput[]): FileChange[] {
    const currentFiles = this.fs.project.files.map((f) => f.name);
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
          currentFiles={new Set(this.fs.project.files.map((f) => f.name))}
          inputs={inputs}
        />
      ),
      actionLabel: this.intl.formatMessage({ id: "confirm" }),
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
      detail: await this.fs.statistics(),
    });

    if (this.device.status === ConnectionStatus.NOT_SUPPORTED) {
      this.webusbNotSupportedError();
      return;
    }

    try {
      const progress = (value: number | undefined) => {
        this.dialogs.progress({
          header: this.intl.formatMessage({ id: "flashing-code" }),
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
      detail: await this.fs.statistics(),
    });

    let download: DownloadData | undefined;
    try {
      download = await this.fs.toHexForDownload();
    } catch (e) {
      this.actionFeedback.expectedError({
        title: this.intl.formatMessage({ id: "failed-to-build-hex" }),
        // Not translated, see https://github.com/microbit-foundation/python-editor-next/issues/159
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
      type: "download-file",
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
      type: "download-main-file",
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

  downloadMicrofsFiles = async () => {
    this.logging.event({
      type: "download-microfs-files",
    });
    if ( this.device.status != "CONNECTED" )
    {
      // TODO: make my own error (or is there an appropriate one?)
      return this.webusbNotSupportedError();
    }
    let output = ""
    let foundOK = false
    const serialListener = (data: string) => {
      output = output + data;
      if(!foundOK)
      {
        const okindex = output.indexOf("OK");
        if(okindex != -1)
        {
          output = output.substring(okindex+2);
          foundOK = true;
        }
      }
      if(foundOK)
      {
        const endindex = output.indexOf("END\r");
        if(endindex != -1)
        {
          output = output.substring(endindex, -1)
          this.device.removeListener(EVENT_SERIAL_DATA, serialListener);

          // We got a complete file.
          // Decode the hex and send as a data URI.
          const lines = output.split("\r\n").map(l => unescape(l))
          const blob = new Blob(lines, {
            type: "application/octet-stream",
          });
          saveAs(blob, 'data.txt');
        }
      }
    };
    this.device.on(EVENT_SERIAL_DATA, serialListener);

    // This script is similar to the one used by microfs.py: It enters
    // raw mode and reads the file 32 bytes at a time.  Unlike
    // microfs.py, which uses repr(), here we convert each byte to
    // urlencoded hex.
    //
    // We probably need to figure out how to enter raw mode more
    // reliably (microfs.py has some delays that I did not implement,
    // and I have no error handling at all here) and disable Xterm
    // output while doing the download.
    //
    // Note that there's an apparent bug with sending multiple lines
    // at a time:
    // https://github.com/microbit-foundation/python-editor-next/issues/215
    const script = [
      '\x02', // Ctrl+B to end raw mode if required
      '\x03', // Ctrl+C three times to break
      '\x03',
      '\x03',
      '\x01', // Ctrl+A to enter raw mode
      'f = open("data.txt", "rb")\r\n',
      'r = f.read\r\n',
      'result = True\r\n',
      'while result:\r\n',
      '  result = r(32)\r\n',
      '  if result:\r\n',
      '    print("".join("%%%02x" % i for i in result)+"\\r\\n")\r\n',
      'print("END\\r\\n")\r\n',
      'f.close()\r\n',
      '\x04', // Ctrl+D to run script
      '\x02', // Ctrl+B to exit raw mode
    ];

    // there's probably a more correct way to send one line at a time
    // asynchronously
    let i = 0;
    let p = null;
    const f = () => {
      if (i >= script.length) return;
      p = this.device.serialWrite(script[i]);
      i = i + 1;
      p.then(f);
    }
    f();
  };

  /**
   * Create a file, prompting the user for the name.
   */
  createFile = async () => {
    this.logging.event({
      type: "create-file",
    });

    const preexistingFiles = new Set(this.fs.project.files.map((f) => f.name));
    const validate = (filename: string) =>
      validateNewFilename(filename, (f) => preexistingFiles.has(f), this.intl);
    const filenameWithoutExtension = await this.dialogs.input<string>({
      header: this.intl.formatMessage({ id: "create-python" }),
      Body: NewFileNameQuestion,
      initialValue: "",
      actionLabel: this.intl.formatMessage({ id: "create" }),
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
        this.actionFeedback.success({
          title: this.intl.formatMessage({ id: "created-file" }, { filename }),
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
          actionLabel: this.intl.formatMessage({ id: "delete-button" }),
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
