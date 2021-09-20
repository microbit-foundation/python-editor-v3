/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fromByteArray, toByteArray } from "base64-js";
import { Logging } from "../logging/logging";
import { defaultInitialProject } from "./initial-project";

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
  clear(): Promise<void>;
}

/**
 * Basic in-memory implementation.
 */
export class InMemoryFSStorage implements FSStorage {
  private _projectName: string;
  private _data: Map<string, Uint8Array> = new Map();

  constructor(private defaultProjectName: string) {
    this._projectName = defaultProjectName;
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
  async clear() {
    this._data.clear();
    this._projectName = this.defaultProjectName;
  }
}

const fsPrefix = "fs/";

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
    this.storage.setItem("projectName", projectName);
  }

  async projectName(): Promise<string> {
    return this.storage.getItem("projectName") || defaultInitialProject.name;
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
          await copy(secondary, primary);
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

  async projectName(): Promise<string> {
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

const copy = async (from: FSStorage, to: FSStorage) => {
  const files = await from.ls();
  return Promise.all(
    files.map(async (f) => {
      const v = await from.read(f);
      return to.write(f, v);
    })
  );
};
