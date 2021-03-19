import {
  getIntelHexAppendedScript,
  MicropythonFsHex,
} from "@microbit/microbit-fs";
import EventEmitter from "events";
import config from "../config";
import { BoardId } from "../device/board-id";
import { Logging } from "../logging/logging";
import { asciiToBytes, generateId } from "./fs-util";
import initialCode from "./initial-code";
import { MicroPythonSource } from "./micropython";
import {
  FileVersion,
  FSStorage,
  InMemoryFSStorage,
  VersionAction,
  VersionedData,
} from "./storage";

const commonFsSize = 20 * 1024;

/**
 * All size-related stats will be -1 until the file system
 * has fully initialized.
 */
export interface Project {
  /**
   * An ID for the project.
   */
  id: string;

  /**
   * A user-defined name for the project.
   */
  name: string;

  /**
   * The files in the project.
   */
  files: FileVersion[];
}

export const EVENT_PROJECT_UPDATED = "project_updated";
export const MAIN_FILE = "main.py";

export interface FlashData {
  bytes: Uint8Array;
  intelHex: ArrayBuffer;
}

export type FlashDataSource = (boardId: BoardId) => Promise<FlashData>;

export interface DownloadData {
  intelHex: string;
  filename: string;
}

/**
 * The MicroPython file system adapted for convienient use from the UI.
 *
 * For now we store contents in-memory only, but we may back this
 * with localStorage or IndexDB later.
 *
 * We version files in a way that's designed to make UI updates simple.
 * If a UI action updates a file (e.g. load from disk) then we bump its version.
 * If the file is simply edited in the tool then we do not change its version
 * or fire any events. This plays well with uncontrolled embeddings of
 * third-party text editors.
 */
export class FileSystem extends EventEmitter {
  private initializing: Promise<void> | undefined;
  private storage: FSStorage = new InMemoryFSStorage();
  private fs: undefined | MicropythonFsHex;
  project: Project = {
    files: [],
    id: generateId(),
    name: config.defaultProjectName,
  };

  constructor(
    private logging: Logging,
    private microPythonSource: MicroPythonSource
  ) {
    super();
  }

  /**
   * Run an initialization asyncrounously.
   *
   * If it fails, we'll handle the error and attempt reinitialization on demand.
   */
  async initializeInBackground() {
    // It's been observed that this can be slow after the fetch on low-end devices,
    // so it might be good to move the FS work to a worker if we can't make it fast.
    this.initialize().catch((e) => {
      this.initializing = undefined;
    });
  }

  async initialize(): Promise<MicropythonFsHex> {
    if (this.fs) {
      return this.fs;
    }
    if (!this.initializing) {
      this.initializing = (async () => {
        // For now we always start with this.
        await this.write(MAIN_FILE, initialCode, VersionAction.INCREMENT);

        const fs = await this.createInternalFileSystem();
        await this.initializeFsFromStorage(fs);
        this.fs = fs;
        this.initializing = undefined;
        this.logging.log("Initialized file system");
        await this.notify();
      })();
    }
    await this.initializing;
    return this.fs!;
  }

  /**
   * Update the project name.
   *
   * @param projectName New project name.
   */
  async setProjectName(projectName: string) {
    await this.storage.setProjectName(projectName);
    return this.notify();
  }

  /**
   * Read data from a file.
   *
   * @param filename The filename.
   * @returns The data. See class comment for detail on the versioning.
   * @throws If the file does not exist.
   */
  async read(filename: string): Promise<VersionedData> {
    return this.storage.read(filename);
  }

  /**
   * Check if a file exists.
   *
   * @param filename The filename.
   * @returns The promise of existence.
   */
  async exists(filename: string): Promise<boolean> {
    return this.storage.exists(filename);
  }

  /**
   * Writes the file to storage.
   *
   * Editors perform in-place writes that maintain the file version.
   * Other UI actions increment the file version so that editors can be updated as required.
   *
   * @param filename The file to write to.
   * @param content The file content. Text will be serialized as UTF-8.
   * @param versionAction The file version update required.
   */
  async write(
    filename: string,
    content: Uint8Array | string,
    versionAction: VersionAction
  ) {
    if (typeof content === "string") {
      content = new TextEncoder().encode(content);
    }
    await this.storage.write(filename, content, versionAction);
    if (this.fs) {
      this.fs.write(filename, content);
    }
    if (versionAction === VersionAction.INCREMENT) {
      this.notify();
    } else {
      // Nothing can have changed, don't needlessly change the identity of our file objects.
    }
  }

  async replaceWithHexContents(
    projectName: string,
    hex: string
  ): Promise<void> {
    const fs = await this.initialize();
    try {
      fs.importFilesFromHex(hex, {
        overwrite: true,
        formatFirst: true,
      });
    } catch (e) {
      const code = getIntelHexAppendedScript(hex);
      if (!code) {
        throw new Error("No appended code found in the hex file");
      }
      fs.ls().forEach((f) => fs.remove(f));
      fs.write(MAIN_FILE, code);
    }

    this.project = {
      ...this.project,
      id: generateId(),
    };
    await this.storage.setProjectName(projectName);
    await this.overwriteStorageWithFs();
    return this.notify();
  }

  async replaceWithMainContents(
    projectName: string,
    text: string
  ): Promise<void> {
    const fs = await this.initialize();
    fs.ls().forEach((f) => fs.remove(f));
    fs.write(MAIN_FILE, text);
    await this.storage.setProjectName(projectName);
    await this.overwriteStorageWithFs();
    this.project = {
      ...this.project,
      // New project, just as if we'd loaded a hex file.
      id: generateId(),
    };
    return this.notify();
  }

  async remove(filename: string): Promise<void> {
    await this.storage.remove(filename);
    if (this.fs) {
      this.fs.remove(filename);
    }
    return this.notify();
  }

  private async notify() {
    const files = await this.storage.ls();
    this.project = {
      ...this.project,
      name: await this.storage.projectName(),
      files,
    };
    this.logging.log(this.project);
    this.emit(EVENT_PROJECT_UPDATED, this.project);
  }

  async toHexForDownload(): Promise<DownloadData> {
    const fs = await this.initialize();
    return {
      filename: `${this.project.name}.hex`,
      intelHex: fs.getUniversalHex(),
    };
  }

  /**
   * Partial flashing can use just the flash bytes,
   * Full flashing needs the entire Intel Hex to include the UICR data
   *
   * @param boardId The board ID (from the WebUSB connection).
   */
  async toHexForFlash(boardId: BoardId): Promise<FlashData> {
    const fs = await this.initialize();
    const normalisedId = boardId.normalize().id;
    return {
      bytes: fs.getIntelHexBytes(normalisedId),
      intelHex: asciiToBytes(fs.getIntelHex(normalisedId)),
    };
  }

  private assertInitialized(): MicropythonFsHex {
    if (!this.fs) {
      throw new Error("Must be initialized");
    }
    return this.fs;
  }

  private async initializeFsFromStorage(fs: MicropythonFsHex) {
    fs.ls().forEach(fs.remove.bind(fs));
    for (const file of await this.storage.ls()) {
      const { data } = await this.storage.read(file.name);
      fs.write(file.name, data);
    }
  }

  private async overwriteStorageWithFs() {
    const fs = this.assertInitialized();
    const keep = new Set(fs.ls());
    await Promise.all(
      (await this.storage.ls())
        .filter((f) => !keep.has(f.name))
        .map((f) => this.storage.remove(f.name))
    );
    for (const filename of Array.from(keep)) {
      await this.storage.write(
        filename,
        fs.readBytes(filename),
        VersionAction.INCREMENT
      );
    }
  }

  private createInternalFileSystem = async () => {
    const microPython = await this.microPythonSource();
    return new MicropythonFsHex(microPython, {
      maxFsSize: commonFsSize,
    });
  };
}
