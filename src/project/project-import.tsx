/**
 * Bringing files into the editor.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { isMakeCodeForV1Hex as isMakeCodeForV1HexNoErrorHandling } from "@microbit/microbit-universal-hex";
import { Link, List, ListItem, Text } from "@microbit/ui";
import { ReactNode } from "react";
import { IntlShape } from "react-intl";
import { Stack } from "styled-system/jsx";
import { ActionFeedback } from "../common/use-action-feedback";
import { defaultProjectFiles } from "../fs/current-project";
import { FileSystem, MAIN_FILE, VersionAction } from "../fs/fs";
import {
  getLowercaseFileExtension,
  isPythonMicrobitModule,
  readFileAsText,
  readFileAsUint8Array,
} from "../fs/fs-util";
import { importFormat } from "../logging/analytics";
import { Logging } from "../logging/logging";
import { FileChange, FileOperation } from "./changes";
import { isPythonFile } from "./project-utils";
import { Projects } from "./projects";

export type ImportSource = "drop" | "file_picker";
export type ImportSurface = "editor" | "home";

export interface ImportedFile {
  name: string;
  data: Uint8Array;
}

export interface NewProjectFiles {
  /** A name taken from the file, or undefined for the untitled default. */
  name: string | undefined;
  files: Record<string, Uint8Array>;
}

type ImportKind =
  | { kind: "hex"; file: File }
  | { kind: "files" }
  | { kind: "error"; messageId: "load-error-mpy" | "load-error-mixed" };

const classify = (files: File[]): ImportKind => {
  const extensions = new Set(
    files.map((f) => getLowercaseFileExtension(f.name))
  );
  if (extensions.has("mpy")) {
    return { kind: "error", messageId: "load-error-mpy" };
  }
  if (extensions.has("hex")) {
    return files.length > 1
      ? { kind: "error", messageId: "load-error-mixed" }
      : { kind: "hex", file: files[0] };
  }
  return { kind: "files" };
};

/**
 * Arranges files into a new project.
 *
 * A single Python script (not a marked module) becomes main.py and names the
 * project, which is what opening a saved program wants. Otherwise files keep
 * their names and the starter main.py is added if there is none.
 */
export const filesForNewProject = (inputs: ImportedFile[]): NewProjectFiles => {
  const files: Record<string, Uint8Array> = Object.fromEntries(
    inputs.map((f) => [f.name, f.data])
  );
  let name: string | undefined;
  if (!(MAIN_FILE in files)) {
    const scripts = inputs.filter(
      (f) =>
        isPythonFile(f.name) &&
        !isPythonMicrobitModule(new TextDecoder().decode(f.data))
    );
    if (scripts.length === 1) {
      const [script] = scripts;
      delete files[script.name];
      files[MAIN_FILE] = script.data;
      name = script.name.replace(/\.py$/i, "");
    } else {
      Object.assign(files, defaultProjectFiles());
    }
  }
  return { name, files };
};

/**
 * Imports files from the editor or the home page.
 *
 * A hex is always a whole program, so it becomes a new project; with the
 * projects database unavailable it replaces the single implicit project
 * instead. Other files join the open project when imported from the editor,
 * and make a new project from the home page.
 */
export class ProjectImporter {
  constructor(
    private fs: FileSystem,
    private projects: Projects | undefined,
    private actionFeedback: ActionFeedback,
    private intl: IntlShape,
    private logging: Logging
  ) {}

  /**
   * A hex becomes a new project; other files are added to the open project,
   * replacing any with the same names.
   */
  importIntoEditor = async (
    files: File[],
    source: ImportSource
  ): Promise<void> => {
    const kind = this.begin(files, source, "editor");
    switch (kind.kind) {
      case "error":
        return this.loadError(files, kind.messageId);
      case "hex":
        await this.newProjectFromHex(kind.file);
        return;
      case "files":
        return this.addToProject(await this.readAll(files));
    }
  };

  /**
   * The files become a new project, open in the editor.
   *
   * @returns True if a project was created.
   */
  importAsNewProject = async (
    files: File[],
    source: ImportSource
  ): Promise<boolean> => {
    const kind = this.begin(files, source, "home");
    switch (kind.kind) {
      case "error":
        this.loadError(files, kind.messageId);
        return false;
      case "hex":
        return this.newProjectFromHex(kind.file);
      case "files": {
        const inputs = await this.readAll(files);
        const project = filesForNewProject(inputs);
        try {
          await this.newProject(project.name, project.files);
        } catch (e) {
          this.actionFeedback.unexpectedError(e);
          return false;
        }
        this.actionFeedback.success(
          inputs.length === 1
            ? this.loadedFeedback(inputs[0].name)
            : this.summarizeChanges(
                inputs.map((f) => ({
                  name: f.name,
                  data: () => Promise.resolve(f.data),
                  operation: FileOperation.ADD,
                }))
              )
        );
        return true;
      }
    }
  };

  /**
   * Opens a new project with these files, or replaces the implicit project
   * where there is no projects database.
   */
  newProject = async (
    name: string | undefined,
    files: Record<string, Uint8Array>
  ): Promise<void> => {
    if (this.projects && (await this.projects.isAvailable())) {
      await this.projects.createFromFiles(name, files);
    } else {
      await this.fs.replaceWithFiles(name, files);
    }
  };

  private begin(
    files: File[],
    source: ImportSource,
    surface: ImportSurface
  ): ImportKind {
    if (files.length === 0) {
      throw new Error("Expected to be called with at least one file");
    }
    this.logging.event({
      type: "project_import",
      detail: { source, format: importFormat(files), surface },
    });
    // Avoid lingering messages related to the previous project.
    // Also makes e2e testing easier.
    this.actionFeedback.closeAll();
    return classify(files);
  }

  private async newProjectFromHex(file: File): Promise<boolean> {
    const name = file.name.replace(/\.hex$/i, "");
    const hex = await readFileAsText(file);
    let files: Record<string, Uint8Array>;
    try {
      files = await this.fs.filesFromHex(hex);
    } catch (e: any) {
      this.hexError(file, hex, e);
      return false;
    }
    try {
      await this.newProject(name, files);
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
      return false;
    }
    this.actionFeedback.success(this.loadedFeedback(file.name));
    return true;
  }

  private async addToProject(inputs: ImportedFile[]): Promise<void> {
    const current = new Set(this.fs.project.files.map((f) => f.name));
    const changes: FileChange[] = inputs.map((f) => ({
      name: f.name,
      data: () => Promise.resolve(f.data),
      operation: current.has(f.name)
        ? FileOperation.REPLACE
        : FileOperation.ADD,
    }));
    try {
      for (const change of changes) {
        await this.fs.write(
          change.name,
          await change.data(),
          VersionAction.INCREMENT
        );
      }
      this.actionFeedback.success(this.summarizeChanges(changes));
    } catch (e: any) {
      this.actionFeedback.unexpectedError(e);
    }
  }

  private async readAll(files: File[]): Promise<ImportedFile[]> {
    return Promise.all(
      files.map(async (f) => ({
        name: f.name,
        data: await readFileAsUint8Array(f),
      }))
    );
  }

  private loadErrorTitle(files: File[]): string {
    return this.intl.formatMessage(
      { id: "load-error-title" },
      { fileCount: files.length }
    );
  }

  private loadError(files: File[], messageId: string): void {
    this.actionFeedback.expectedError({
      title: this.loadErrorTitle(files),
      description: this.intl.formatMessage({ id: messageId }),
    });
  }

  private hexError(file: File, hex: string, e: any): void {
    const isMakeCodeHex = isMakeCodeForV1Hex(hex);
    // Ideally we'd make FormattedMessage work in toasts, but it does not so using intl.
    this.actionFeedback.expectedError({
      title: this.loadErrorTitle([file]),
      description: isMakeCodeHex ? (
        <Stack gap="0.5">
          <Text>
            {this.intl.formatMessage({
              id: "load-error-makecode-info",
            })}
          </Text>
          <Text>
            {this.intl.formatMessage(
              { id: "load-error-makecode-link" },
              {
                link: (chunks: ReactNode) => (
                  <Link
                    target="_blank"
                    rel="noopener"
                    href="https://makecode.microbit.org/"
                  >
                    {chunks}
                  </Link>
                ),
              }
            )}
          </Text>
        </Stack>
      ) : (
        e.message
      ),
    });
  }

  private loadedFeedback(filename: string) {
    return {
      title: this.intl.formatMessage(
        { id: "loaded-file-feedback" },
        { filename }
      ),
    };
  }

  private summarizeChanges(changes: FileChange[]) {
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
  }

  private summarizeChange(change: FileChange): string {
    return this.intl.formatMessage(
      {
        id:
          change.operation === FileOperation.REPLACE
            ? "updated-change"
            : "added-change",
      },
      { changeName: change.name }
    );
  }
}

const isMakeCodeForV1Hex = (hexStr: string) => {
  try {
    return isMakeCodeForV1HexNoErrorHandling(hexStr);
  } catch {
    // We just use this to give a better message in error scenarios so we don't
    // care if we failed to parse it etc.
    return false;
  }
};
