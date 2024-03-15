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
  setProjectName(projectName: string | undefined): Promise<void>;
  projectName(): Promise<string | undefined>;
  clear(): Promise<void>;
  /**
   * We persist the dirty flag so that we know whether the user
   * had previously made changes after a restore from storage.
   */
  markDirty(): Promise<void>;
  clearDirty(): Promise<void>;
  isDirty(): Promise<boolean>;
}

/**
 * Basic in-memory implementation.
 */
export class InMemoryFSStorage implements FSStorage {
  private _projectName: string | undefined;
  private _data: Map<string, Uint8Array> = new Map();
  private _dirty: boolean = false;

  constructor(projectName: string | undefined) {
    this._projectName = projectName;
  }

  async ls() {
    return Array.from(this._data.keys());
  }

  async exists(filename: string) {
    return this._data.has(filename);
  }

  async setProjectName(projectName: string | undefined) {
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
    if (!(await this.exists(name))) {
      throw new Error(`No such file ${name}`);
    }
    this._data.delete(name);
  }
  async clear() {
    this._data.clear();
    this._projectName = undefined;
  }
  async markDirty(): Promise<void> {
    this._dirty = true;
  }
  async clearDirty(): Promise<void> {
    this._dirty = false;
  }
  async isDirty(): Promise<boolean> {
    return this._dirty;
  }
}

const fsFilesPrefix = "fs/files/";
const fsMetadataPrefix = "fs/meta/";
const projectNameKey = fsMetadataPrefix + "projectName";
const dirtyKey = fsMetadataPrefix + "dirty";

/**
 * Session storage version.
 */
export class SessionStorageFSStorage implements FSStorage {
  /**
   * Attempts to create the session storage using the window.
   *
   * Swallows errors accessing window.sessionStorage.
   *
   * @returns The storage if possible, otherwise undefined.
   */
  static create() {
    const sessionStorageIfPossible = () => {
      try {
        return window.sessionStorage;
      } catch (e) {
        // We see SecurityError here in some scenarios
        // https://github.com/microbit-foundation/python-editor-v3/issues/736
        return undefined;
      }
    };
    const storage = sessionStorageIfPossible();
    return storage ? new SessionStorageFSStorage(storage) : undefined;
  }

  constructor(private storage: Storage) {}

  async ls() {
    return Object.keys(this.storage)
      .filter((k) => k.startsWith(fsFilesPrefix))
      .map((k) => k.substring(fsFilesPrefix.length));
  }

  async exists(filename: string) {
    return this.storage.getItem(fsFilesPrefix + filename) !== null;
  }

  async setProjectName(projectName: string | undefined) {
    if (projectName === undefined) {
      this.storage.removeItem(projectNameKey);
    } else {
      this.storage.setItem(projectNameKey, projectName);
    }
  }

  async projectName(): Promise<string | undefined> {
    return this.storage.getItem(projectNameKey) || undefined;
  }

  async read(filename: string): Promise<Uint8Array> {
    const value = this.storage.getItem(fsFilesPrefix + filename);
    if (value === null) {
      throw new Error(`No such file ${filename}`);
    }
    return toByteArray(value);
  }

  async write(name: string, content: Uint8Array): Promise<void> {
    const base64 = fromByteArray(content);
    this.storage.setItem(fsFilesPrefix + name, base64);
  }

  async remove(name: string): Promise<void> {
    if (!(await this.exists(name))) {
      throw new Error(`No such file ${name}`);
    }
    this.storage.removeItem(fsFilesPrefix + name);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async markDirty(): Promise<void> {
    this.storage.setItem(dirtyKey, "true");
  }
  async clearDirty(): Promise<void> {
    this.storage.removeItem(dirtyKey);
  }
  async isDirty(): Promise<boolean> {
    return this.storage.getItem(dirtyKey) === "true";
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

  async markDirty(): Promise<void> {
    await this.initialized;
    await Promise.all([
      this.primary.markDirty(),
      this.secondaryErrorHandle((secondary) => secondary.markDirty()),
    ]);
  }
  async clearDirty(): Promise<void> {
    await this.initialized;
    await Promise.all([
      this.primary.clearDirty(),
      this.secondaryErrorHandle((secondary) => secondary.clearDirty()),
    ]);
  }
  async isDirty(): Promise<boolean> {
    await this.initialized;
    return this.primary.isDirty();
  }
}

const initializeFromStorage = async (from: FSStorage, to: FSStorage) => {
  const files = await from.ls();
  const projectName = await from.projectName();
  await to.setProjectName(projectName);
  if (await from.isDirty()) {
    await to.markDirty();
  } else {
    await to.clearDirty();
  }
  return Promise.all(
    files.map(async (f) => {
      const v = await from.read(f);
      return to.write(f, v);
    })
  );
};
