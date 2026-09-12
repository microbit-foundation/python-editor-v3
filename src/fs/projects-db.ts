/**
 * The projects database in IndexedDB.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { DBSchema, IDBPDatabase, openDB } from "idb";
import { baseUrl } from "../base";
import { Stage, stage as currentStage } from "../environment";

/**
 * Project metadata. Deliberately holds no file content so listing is cheap.
 */
export interface ProjectMeta {
  id: string;
  name: string | undefined;
  /** Last modified or opened, for ordering by recency. */
  timestamp: number;
}

/**
 * A file belonging to a project, keyed by [projectId, name]: a file's name
 * is its identity within a project.
 */
export interface FileRecord {
  projectId: string;
  name: string;
  data: Uint8Array;
}

/**
 * A set of changes to one project, applied in a single transaction.
 */
export interface ProjectChanges {
  meta?: Partial<Omit<ProjectMeta, "id">>;
  writes?: Record<string, Uint8Array>;
  deletes?: string[];
}

const PROJECTS = "projects";
const FILES = "files";
const stores = [PROJECTS, FILES] as const;

interface Schema extends DBSchema {
  [PROJECTS]: {
    key: string;
    value: ProjectMeta;
  };
  [FILES]: {
    key: [string, string];
    value: FileRecord;
    indexes: { projectId: string };
  };
}

const DB_VERSION = 1;

/**
 * Deployments share an origin, so the database name includes the base path
 * to keep production's and beta's libraries apart. Review builds all share
 * one: they are internal, and a project made on one branch is useful on the
 * next. When a schema change breaks it, StorageVersionErrorPage offers to
 * clear it.
 */
export const databaseName = (
  stage: Stage = currentStage,
  base: string = baseUrl
): string => {
  if (stage === "REVIEW") {
    return "python-editor-review";
  }
  return base === "/"
    ? "python-editor"
    : `python-editor${base.replace(/\/$/, "")}`;
};

export class ProjectsDatabase {
  private constructor(private db: IDBPDatabase<Schema>) {}

  /**
   * Opens the database, creating it if needed.
   *
   * @throws a VersionError DOMException if the database exists but lacks the
   * expected stores, which means a newer version of the app created it.
   */
  static async open(name: string = databaseName()): Promise<ProjectsDatabase> {
    const db = await openDB<Schema>(name, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(PROJECTS, { keyPath: "id" });
        const files = db.createObjectStore(FILES, {
          keyPath: ["projectId", "name"],
        });
        files.createIndex("projectId", "projectId");
      },
    });
    for (const store of stores) {
      if (!db.objectStoreNames.contains(store)) {
        db.close();
        throw new DOMException(
          `Database ${name} has no ${store} store; it was created by an incompatible version of the app`,
          "VersionError"
        );
      }
    }
    return new ProjectsDatabase(db);
  }

  close(): void {
    this.db.close();
  }

  /** All projects, most recent first. */
  async list(): Promise<ProjectMeta[]> {
    const all = await this.db.getAll(PROJECTS);
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }

  async get(id: string): Promise<ProjectMeta | undefined> {
    return this.db.get(PROJECTS, id);
  }

  async mostRecent(): Promise<ProjectMeta | undefined> {
    return (await this.list())[0];
  }

  async files(id: string): Promise<Record<string, Uint8Array>> {
    const records = await this.db.getAllFromIndex(FILES, "projectId", id);
    return Object.fromEntries(records.map((r) => [r.name, r.data]));
  }

  async fileNames(id: string): Promise<string[]> {
    const keys = await this.db.getAllKeysFromIndex(FILES, "projectId", id);
    return keys.map(([, name]) => name);
  }

  async file(id: string, name: string): Promise<Uint8Array | undefined> {
    return (await this.db.get(FILES, [id, name]))?.data;
  }

  /** Creates a project and its files atomically. */
  async create(
    meta: ProjectMeta,
    files: Record<string, Uint8Array>
  ): Promise<void> {
    const tx = this.db.transaction(stores, "readwrite");
    await tx.objectStore(PROJECTS).put(meta);
    const fileStore = tx.objectStore(FILES);
    for (const [name, data] of Object.entries(files)) {
      await fileStore.put({ projectId: meta.id, name, data });
    }
    await tx.done;
  }

  /** Applies a set of changes to a project in one transaction. */
  async apply(id: string, changes: ProjectChanges): Promise<void> {
    const tx = this.db.transaction(stores, "readwrite");
    const projects = tx.objectStore(PROJECTS);
    const existing = await projects.get(id);
    if (!existing) {
      throw new Error(`No such project ${id}`);
    }
    await projects.put({ ...existing, ...changes.meta, id });
    const fileStore = tx.objectStore(FILES);
    for (const [name, data] of Object.entries(changes.writes ?? {})) {
      await fileStore.put({ projectId: id, name, data });
    }
    for (const name of changes.deletes ?? []) {
      await fileStore.delete([id, name]);
    }
    await tx.done;
  }

  /** Marks a project as the most recent. */
  async touch(id: string, timestamp: number = Date.now()): Promise<void> {
    await this.apply(id, { meta: { timestamp } });
  }

  async duplicate(sourceId: string, meta: ProjectMeta): Promise<void> {
    await this.create(meta, await this.files(sourceId));
  }

  async delete(id: string): Promise<void> {
    const tx = this.db.transaction(stores, "readwrite");
    await tx.objectStore(PROJECTS).delete(id);
    const fileStore = tx.objectStore(FILES);
    for (const key of await fileStore.index("projectId").getAllKeys(id)) {
      await fileStore.delete(key);
    }
    await tx.done;
  }
}
