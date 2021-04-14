import config from "../config";
import { toByteArray, fromByteArray } from "base64-js";
import { MAIN_FILE } from "./fs";
import initialCode from "./initial-code";

/**
 * Backing storage for the file system.
 *
 * We use this to store and restore the users program.
 *
 * For now we just have an in-memory implementation.
 */
export interface FSStorage {
  ls(): Promise<string[]>;
  exists(filename: string): Promise<boolean>;
  read(filename: string): Promise<Uint8Array>;
  write(filename: string, content: Uint8Array): Promise<void>;
  remove(filename: string): Promise<void>;
  setProjectName(projectName: string): Promise<void>;
  projectName(): Promise<string>;
}

/**
 * Basic in-memory implementation.
 */
export class InMemoryFSStorage implements FSStorage {
  private _projectName: string = config.defaultProjectName;
  private _data: Map<string, Uint8Array> = new Map();

  async ls() {
    return Array.from(this._data.keys());
  }

  async exists(filename: string) {
    return this._data.has(filename);
  }

  async setProjectName(projectName: string) {
    this._projectName = projectName;
  }

  async projectName(): Promise<string> {
    return this._projectName;
  }

  async read(filename: string): Promise<Uint8Array> {
    if (!(await this.exists(filename))) {
      throw new Error(`No such file ${filename}`);
    }
    return this._data.get(filename)!;
  }

  async write(name: string, content: Uint8Array): Promise<void> {
    this._data.set(name, content);
  }

  async remove(name: string): Promise<void> {
    if (!this.exists(name)) {
      throw new Error(`No such file ${name}`);
    }
    this._data.delete(name);
  }
}

const fsPrefix = "fs/";

/**
 * Session storage version.
 */
export class SessionStorageFSStorage implements FSStorage {
  private storage = sessionStorage;
  constructor() {
    if (!this.existsInternal(MAIN_FILE)) {
      this.writeInternal(MAIN_FILE, new TextEncoder().encode(initialCode));
    }
  }

  async ls() {
    return Object.keys(this.storage)
      .filter((k) => k.startsWith(fsPrefix))
      .map((k) => k.substring(fsPrefix.length));
  }

  async exists(filename: string) {
    return this.existsInternal(filename);
  }

  existsInternal(filename: string) {
    return this.storage.getItem(fsPrefix + filename) !== null;
  }

  async setProjectName(projectName: string) {
    this.storage.setItem("projectName", projectName);
  }

  async projectName(): Promise<string> {
    return this.storage.getItem("projectName") || config.defaultProjectName;
  }

  async read(filename: string): Promise<Uint8Array> {
    const value = this.storage.getItem(fsPrefix + filename);
    if (value === null) {
      throw new Error(
        `No such file ${filename}. Keys: ${Object.keys(this.storage)}`
      );
    }
    return toByteArray(value);
  }

  async write(name: string, content: Uint8Array): Promise<void> {
    this.writeInternal(name, content);
  }

  writeInternal(name: string, content: Uint8Array): void {
    const base64 = fromByteArray(content);
    this.storage.setItem(fsPrefix + name, base64);
  }

  async remove(name: string): Promise<void> {
    if (!this.exists(name)) {
      throw new Error(`No such file ${name}`);
    }
    this.storage.removeItem(fsPrefix + name);
  }
}
