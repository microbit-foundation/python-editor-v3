import config from "../config";

export type VersionAction = "maintain" | "increment";

/**
 * Backing storage for the file system.
 *
 * We use this to store and restore the users program.
 *
 * For now we just have an in-memory implementation.
 */
export interface FSStorage {
  ls(): Promise<FileVersion[]>;
  exists(filename: string): Promise<boolean>;
  read(filename: string): Promise<VersionedData>;
  write(
    filename: string,
    content: Uint8Array,
    versionAction: "maintain" | "increment"
  ): Promise<void>;
  remove(filename: string): Promise<void>;
  setProjectName(projectName: string): Promise<void>;
  projectName(): Promise<string>;
}

export interface FileVersion {
  name: string;
  version: number;
}

export interface VersionedData {
  version: number;
  data: Uint8Array;
}

/**
 * Basic in-memory implementation.
 */
export class InMemoryFSStorage implements FSStorage {
  private _projectName: string = config.defaultProjectName;
  private _data: Map<string, VersionedData> = new Map();

  async ls() {
    return Array.from(this._data.entries()).map(([name, value]) => ({
      version: value.version,
      name,
    }));
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

  async read(filename: string): Promise<VersionedData> {
    if (!(await this.exists(filename))) {
      throw new Error(`No such file ${filename}`);
    }
    return this._data.get(filename)!;
  }

  async write(
    name: string,
    content: Uint8Array,
    versionAction: VersionAction
  ): Promise<void> {
    const existing = this._data.get(name);
    let version = existing ? existing.version : 0;
    if (existing === undefined && versionAction === "maintain") {
      throw new Error(`No existing file ${name}`);
    }
    if (versionAction === "increment") {
      version++;
    }
    this._data.set(name, { data: content, version });
  }

  async remove(name: string): Promise<void> {
    if (!this.exists(name)) {
      throw new Error(`No such file ${name}`);
    }
    this._data.delete(name);
  }
}
