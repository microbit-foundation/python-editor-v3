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
    if (!item) {
      throw new Error(`No such file ${name}`);
    }
    return item;
  }
  write(name: string, content: string): void {
    localStorage.setItem(this.prefix + name, content);
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
    if (!this.storage.ls().includes(MAIN_FILE)) {
      this.write(MAIN_FILE, chuckADuck);
    }
    // Run this async.
    // TODO: consider errors and retrying the downloads
    this.initialize();
  }

  async initialize(): Promise<MicropythonFsHex> {
    if (!this.initializing) {
      this.initializing = (async () => {
        const fs = await createInternalFileSystem();
        // Copy everything from storage to the file system.
        for (const filename of this.storage.ls()) {
          fs.write(filename, this.storage.read(filename));
        }
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
      this.fs.write(filename, content);
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
    const spaceUsed = this.fs ? this.fs.getStorageUsed() : -1
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
}

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
