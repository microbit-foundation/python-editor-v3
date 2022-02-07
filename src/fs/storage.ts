/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fromByteArray, toByteArray } from "base64-js";
import { Logging } from "../logging/logging";

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
  projectName(): Promise<string | undefined>;
  clear(): Promise<void>;
}

/**
 * Basic in-memory implementation.
 */
export class InMemoryFSStorage implements FSStorage {
  private _projectName: string | undefined;
  private _data: Map<string, Uint8Array> = new Map();

  constructor(projectName: string | undefined) {
    this._projectName = projectName;
  }

  async ls() {
    return Array.from(this._data.keys());
  }

  async exists(filename: string) {
    return this._data.has(filename);
  }

  async setProjectName(projectName: string) {
    this._projectName = projectName;
  }

  async projectName(): Promise<string | undefined> {
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
  async clear() {
    this._data.clear();
    this._projectName = undefined;
  }
}

const fsPrefix = "fs/";
const projectNameKey = "projectName";

/**
 * Session storage version.
 */
export class SessionStorageFSStorage implements FSStorage {
  constructor(private storage: Storage) {}

  async ls() {
    return Object.keys(this.storage)
      .filter((k) => k.startsWith(fsPrefix))
      .map((k) => k.substring(fsPrefix.length));
  }

  async exists(filename: string) {
    return this.storage.getItem(fsPrefix + filename) !== null;
  }

  async setProjectName(projectName: string) {
    this.storage.setItem(projectNameKey, projectName);
  }

  async projectName(): Promise<string | undefined> {
    return this.storage.getItem(projectNameKey) || undefined;
  }

  async read(filename: string): Promise<Uint8Array> {
    const value = this.storage.getItem(fsPrefix + filename);
    if (value === null) {
      throw new Error(`No such file ${filename}`);
    }
    return toByteArray(value);
  }

  async write(name: string, content: Uint8Array): Promise<void> {
    const base64 = fromByteArray(content);
    this.storage.setItem(fsPrefix + name, base64);
  }

  async remove(name: string): Promise<void> {
    if (!this.exists(name)) {
      throw new Error(`No such file ${name}`);
    }
    this.storage.removeItem(fsPrefix + name);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

/**
 * Reads from primary.
 *
 * Writes to both.
 *
 * If write errors occur it clears primary and discontinues use.
 */
export class SplitStrategyStorage implements FSStorage {
  private initialized: Promise<unknown>;

  constructor(
    private primary: FSStorage,
    private secondary: FSStorage | undefined,
    private log: Logging
  ) {
    this.initialized = secondary
      ? this.secondaryErrorHandle(async () => {
          await initializeFromStorage(secondary, primary);
        })
      : Promise.resolve();
  }

  async ls() {
    await this.initialized;
    return this.primary.ls();
  }

  async exists(filename: string) {
    await this.initialized;
    return this.primary.exists(filename);
  }

  async setProjectName(projectName: string) {
    await this.initialized;
    await Promise.all([
      this.primary.setProjectName(projectName),
      this.secondaryErrorHandle((secondary) =>
        secondary.setProjectName(projectName)
      ),
    ]);
  }

  async projectName(): Promise<string | undefined> {
    await this.initialized;
    return this.primary.projectName();
  }

  async read(filename: string): Promise<Uint8Array> {
    await this.initialized;
    return this.primary.read(filename);
  }

  async write(name: string, content: Uint8Array): Promise<void> {
    await this.initialized;
    await Promise.all([
      this.primary.write(name, content),
      this.secondaryErrorHandle((secondary) => secondary.write(name, content)),
    ]);
  }

  async remove(name: string): Promise<void> {
    await this.initialized;
    await Promise.all([
      this.primary.remove(name),
      this.secondaryErrorHandle((secondary) => secondary.remove(name)),
    ]);
  }

  async clear(): Promise<void> {
    await this.initialized;
    await Promise.all([
      this.primary.clear(),
      this.secondaryErrorHandle((secondary) => secondary.clear()),
    ]);
  }

  private async secondaryErrorHandle(
    action: (secondary: FSStorage) => Promise<void>
  ): Promise<void> {
    if (!this.secondary) {
      return;
    }
    try {
      await action(this.secondary);
    } catch (e1) {
      try {
        await this.secondary.clear();
      } catch (e2) {
        // Not much we can do.
        this.log.error("Failed to clear secondary storage in error scenario");
        this.log.error(e2);
      }
      // Avoid all future errors this session.
      this.log.error("Abandoning secondary storage due to error");
      this.log.error(e1);
      this.secondary = undefined;
    }
  }
}

const initializeFromStorage = async (from: FSStorage, to: FSStorage) => {
  const files = await from.ls();
  const projectName = await from.projectName();
  if (projectName) {
    await to.setProjectName(projectName);
  }
  return Promise.all([
    ...files.map(async (f) => {
      const v = await from.read(f);
      return to.write(f, v);
    }),
  ]);
};
