import { microbitBoardId, MicropythonFsHex } from "@microbit/microbit-fs";
import EventEmitter from "events";
import chuckADuck from "../samples/chuck-a-duck";
import microPythonV1HexUrl from "./microbit-micropython-v1.hex";
import microPythonV2HexUrl from "./microbit-micropython-v2.hex";

const commonFsSize = 20 * 1024;

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

export const createInternalFileSystem = async () => {
  const microPython = await fetchMicroPython();
  return new MicropythonFsHex(microPython, {
    maxFsSize: commonFsSize,
  });
};

export interface File {
  name: string;
  size: number;
}

export interface FileSystemState {
  files: File[];
  spaceUsed: number;
  spaceRemaining: number;
  space: number;
}

export const EVENT_STATE = "state";

export const MAIN_FILE = "main.py";

/**
 * A MicroPython file system.
 *
 * We should rejig to background the initialization and prioritise
 * an in-memory/local storage version of the data as that can be
 * synchronously (or at least, quickly) initialized.
 */
export class FileSystem extends EventEmitter {
  private initializing: Promise<MicropythonFsHex> | undefined;
  private fs: undefined | MicropythonFsHex;

  async initialize(): Promise<MicropythonFsHex> {
    if (!this.initializing) {
      this.initializing = (async () => {
        const fs = await createInternalFileSystem();
        // We should integrate per-file local storage support into this file.
        let text = localStorage.getItem("text");
        if (!text || text.trim().length === 0) {
          // Temporary, useful for demos.
          text = chuckADuck;
        }
        fs.write(MAIN_FILE, text);
        return fs;
      })();
    }
    this.fs = await this.initializing;
    this.notify();
    return this.fs;
  }

  private assertInitialized(): MicropythonFsHex {
    if (!this.fs) {
      throw new Error("Uninitialized file system");
    }
    return this.fs;
  }

  read(filename: string): string {
    const fs = this.assertInitialized();
    return fs.read(filename);
  }

  write(filename: string, content: string) {
    const fs = this.assertInitialized();
    if (filename === MAIN_FILE) {
      localStorage.setItem("text", content);
    }
    fs.write(filename, content);
    this.notify();
  }

  notify(): void {
    if (this.fs) {
      const files = this.fs.ls().map((name) => ({
        name,
        size: this.fs!.size(name),
      }));
      const spaceUsed = this.fs.getStorageUsed();
      const spaceRemaining = this.fs.getStorageRemaining();
      const space = this.fs.getStorageSize();
      const state = {
        files,
        spaceUsed,
        spaceRemaining,
        space,
      };
      this.emit(EVENT_STATE, state);
    }
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
