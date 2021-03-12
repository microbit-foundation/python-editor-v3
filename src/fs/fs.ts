import { microbitBoardId, MicropythonFsHex } from "@microbit/microbit-fs";
import EventEmitter from "events";
import config from "../config";
import { BoardId } from "../device/board-id";
import chuckADuck from "../samples/chuck-a-duck";
import { generateId } from "./fs-util";
import microPythonV1HexUrl from "./microbit-micropython-v1.hex";
import microPythonV2HexUrl from "./microbit-micropython-v2.hex";
import { FSLocalStorage, FSStorage } from "./storage";

export interface File {
  name: string;
  size: number;
}

/**
 * All size-related stats will be -1 until the file system
 * has fully initialized.
 */
export interface Project {
  /**
   * An ID for the project.
   */
  projectId: string;
  /**
   * A user-defined name for the project.
   */
  projectName: string;

  files: File[];
  spaceUsed: number;
  spaceRemaining: number;
  space: number;
}

export const EVENT_STATE = "state";
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
 * A MicroPython file system.
 */
export class FileSystem extends EventEmitter {
  private initializing: Promise<void> | undefined;
  private storage: FSStorage = new FSLocalStorage();
  private fs: undefined | MicropythonFsHex;
  state: Project = {
    files: [],
    space: -1,
    spaceRemaining: -1,
    spaceUsed: -1,
    projectId: generateId(),
    projectName: this.storage.projectName(),
  };

  constructor() {
    super();
    // Temporary!
    if (
      !this.storage.ls().includes(MAIN_FILE) ||
      this.storage.read(MAIN_FILE).length === 0
    ) {
      this.write(MAIN_FILE, chuckADuck);
    }
    // Run this async as it'll download > 1MB of MicroPython.
    this.initialize().catch((e) => {
      // Clear the promise so we'll initialize on demand later.
      this.initializing = undefined;
    });
  }

  async initialize(): Promise<MicropythonFsHex> {
    if (this.fs) {
      return this.fs;
    }
    if (!this.initializing) {
      this.initializing = (async () => {
        const fs = await createInternalFileSystem();
        this.replaceFsWithStorage(fs);
        this.fs = fs;
        this.initializing = undefined;
        this.notify();
      })();
    }
    await this.initializing;
    return this.fs!;
  }

  setProjectName(projectName: string) {
    this.storage.setProjectName(projectName);
    this.notify();
  }

  read(filename: string): string {
    return this.storage.read(filename);
  }

  exists(filename: string): boolean {
    return this.storage.exists(filename);
  }

  /**
   * Writes the file to storage.
   *
   * No events are fired for writes.
   */
  write(filename: string, content: string) {
    this.storage.write(filename, content);
    if (this.fs) {
      // We could queue them / debounce here? Though we'd need
      // to make sure to sync with it when we needed the FS to
      // be accurate.
      this.fs.write(filename, contentForFs(content));
    }
    this.notify();
  }

  async replaceWithHexContents(hex: string): Promise<void> {
    const fs = await this.initialize();
    const files = fs.importFilesFromHex(hex, {
      overwrite: true,
      formatFirst: true,
    });
    if (files.length === 0) {
      fs.create(MAIN_FILE, contentForFs(""));
    }
    this.state = {
      ...this.state,
      projectId: generateId(),
    };
    // For now this isn't stored, so clear it.
    this.storage.setProjectName(config.defaultProjectName);
    this.replaceStorageWithFs();
    this.notify();
  }

  async replaceWithMainContents(text: string): Promise<void> {
    await this.initialize();
    this.storage.ls().forEach((f) => this.storage.remove(f));
    this.storage.write(MAIN_FILE, text);
    // For now this isn't stored, so clear it.
    this.storage.setProjectName(config.defaultProjectName);
    this.replaceFsWithStorage();
    this.state = {
      ...this.state,
      // New project, just as if we'd loaded a hex file.
      projectId: generateId(),
    };
    this.notify();
  }

  async addOrUpdateModule(filename: string, text: string): Promise<void> {
    this.storage.write(filename, text);
    this.replaceFsWithStorage();
    this.state = {
      ...this.state,
      // This is too much. We could introduce a per-file id.
      projectId: generateId(),
    };
    this.notify();
  }

  remove(filename: string): void {
    this.storage.remove(filename);
    if (this.fs) {
      this.fs.remove(filename);
    }
    this.notify();
  }

  private notify(): void {
    // The real file system has size information, so prefer it when available.
    const source = this.fs || this.storage;
    const files = source.ls().map((name) => ({
      name,
      size: this.fs ? this.fs.size(name) : -1,
    }));
    const spaceUsed = this.fs ? this.fs.getStorageUsed() : -1;
    const spaceRemaining = this.fs ? this.fs.getStorageRemaining() : -1;
    const space = this.fs ? this.fs.getStorageSize() : -1;
    this.state = {
      ...this.state,
      projectName: this.storage.projectName(),
      files,
      spaceUsed,
      spaceRemaining,
      space,
    };
    this.emit(EVENT_STATE, this.state);
  }

  async toHexForDownload(): Promise<DownloadData> {
    const fs = await this.initialize();
    return {
      filename: `${this.state.projectName}.hex`,
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

  private replaceFsWithStorage(fs?: MicropythonFsHex) {
    fs = fs || this.assertInitialized();
    fs.ls().forEach(fs.remove.bind(fs));
    for (const filename of this.storage.ls()) {
      fs.write(filename, contentForFs(this.storage.read(filename)));
    }
  }

  private replaceStorageWithFs() {
    const fs = this.assertInitialized();
    this.storage.ls().forEach(this.storage.remove.bind(this.storage));
    for (const filename of fs.ls()) {
      this.storage.write(filename, fs.read(filename));
    }
  }
}

const contentForFs = (content: string) => {
  // The FS library barfs on empty files, so workaround until we can discuss.
  const hack = content.length === 0 ? "\n" : content;
  return hack;
};

export const microPythonVersions = [
  { url: microPythonV1HexUrl, boardId: microbitBoardId.V1, version: "1.0.1" },
  {
    url: microPythonV2HexUrl,
    boardId: microbitBoardId.V2,
    version: "2.0.0-beta.4",
  },
];

const fetchValidText = async (input: RequestInfo) => {
  const response = await fetch(input);
  if (response.status !== 200) {
    throw new Error(
      `Unexpected status: ${response.statusText} ${response.status}`
    );
  }
  return response.text();
};

const fetchMicroPython = async () =>
  Promise.all(
    microPythonVersions.map(async ({ boardId, url }) => {
      const hex = await fetchValidText(url);
      return { boardId, hex };
    })
  );

const commonFsSize = 20 * 1024;

export const createInternalFileSystem = async () => {
  const microPython = await fetchMicroPython();
  return new MicropythonFsHex(microPython, {
    maxFsSize: commonFsSize,
  });
};

const asciiToBytes = (str: string): ArrayBuffer => {
  var bytes = new Uint8Array(str.length);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
};
