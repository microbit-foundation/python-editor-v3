import { microbitBoardId, MicropythonFsHex } from "@microbit/microbit-fs";
import EventEmitter from "events";
import chuckADuck from "../samples/chuck-a-duck";
import microPythonV1HexUrl from "./microbit-micropython-v1.hex";
import microPythonV2HexUrl from "./microbit-micropython-v2.hex";

export interface File {
  name: string;
  size: number;
}

/**
 * All size-related stats will be -1 until the file system
 * has fully initialized.
 */
export interface FileSystemState {
  files: File[];
  spaceUsed: number;
  spaceRemaining: number;
  space: number;
}

export const EVENT_STATE = "state";

export const MAIN_FILE = "main.py";

interface Storage {
  ls(): string[];
  read(filename: string): string;
  write(filename: string, content: string): void;
  remove(filename: string): void;
}

/**
 * At some point this will need to deal with multiple tabs.
 *
 * At the moment both tabs will overwrite each other's main.py,
 * but it's even more confusing if they have other files.
 */
class LocalStorage implements Storage {
  private prefix = "fs/";

  ls() {
    return Object.keys(localStorage)
      .filter((n) => n.startsWith(this.prefix))
      .map((n) => n.substring(this.prefix.length));
  }

  read(name: string): string {
    const item = localStorage.getItem(this.prefix + name);
    if (typeof item !== "string") {
      throw new Error(`No such file ${name}`);
    }
    return item;
  }

  write(name: string, content: string): void {
    localStorage.setItem(this.prefix + name, content);
  }

  remove(name: string): void {
    this.read(name);
    localStorage.removeItem(this.prefix + name);
  }
}

/**
 * A MicroPython file system.
 */
export class FileSystem extends EventEmitter {
  private initializing: Promise<MicropythonFsHex> | undefined;
  private storage = new LocalStorage();
  private fs: undefined | MicropythonFsHex;
  state: FileSystemState = {
    files: [],
    space: -1,
    spaceRemaining: -1,
    spaceUsed: -1,
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
    // TODO: Consider errors and retrying if downloads fail.
    this.initialize();
  }

  async initialize(): Promise<MicropythonFsHex> {
    if (!this.initializing) {
      this.initializing = (async () => {
        const fs = await createInternalFileSystem();
        this.copyStorageToFs(fs);
        return fs;
      })();
    }
    this.fs = await this.initializing;
    this.notify();
    return this.fs;
  }

  read(filename: string): string {
    return this.storage.read(filename);
  }

  write(filename: string, content: string) {
    this.storage.write(filename, content);
    if (this.fs) {
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
      // Reinstate from storage.
      this.copyStorageToFs();
      throw new Error("The filesystem in the hex file was empty");
    } else {
      this.copyFsToStorage();
      this.notify();
    }
  }

  remove(filename: string): void {
    this.storage.remove(filename);
    if (this.fs) {
      this.fs.remove(filename);
    }
    this.notify();
  }

  notify(): void {
    // The real file system has size information, so prefer it when available.
    const source = this.storage || this.fs;
    const files = source.ls().map((name) => ({
      name,
      size: this.fs ? this.fs.size(name) : -1,
    }));
    const spaceUsed = this.fs ? this.fs.getStorageUsed() : -1;
    const spaceRemaining = this.fs ? this.fs.getStorageRemaining() : -1;
    const space = this.fs ? this.fs.getStorageSize() : -1;
    this.state = {
      files,
      spaceUsed,
      spaceRemaining,
      space,
    };
    this.emit(EVENT_STATE, this.state);
  }

  async toHexForDownload() {
    const fs = await this.initialize();
    return fs.getUniversalHex();
  }

  async toHexForFlash(boardId: number) {
    const fs = await this.initialize();
    return fs.getIntelHex(boardId);
  }

  private assertInitialized(): MicropythonFsHex {
    if (!this.fs) {
      throw new Error("Must be initialized");
    }
    return this.fs;
  }

  private copyStorageToFs(fs?: MicropythonFsHex) {
    fs = fs || this.assertInitialized();
    for (const filename of this.storage.ls()) {
      fs.write(filename, contentForFs(this.storage.read(filename)));
    }
  }

  private copyFsToStorage() {
    const fs = this.assertInitialized();
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

const microPythonVersions = [
  { url: microPythonV1HexUrl, boardId: microbitBoardId.V1 },
  { url: microPythonV2HexUrl, boardId: microbitBoardId.V2 },
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
