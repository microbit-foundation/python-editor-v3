/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { DBSchema, IDBPDatabase, openDB } from "idb";

/**
 * A project as persisted in IndexedDB.
 *
 * This is the multi-project "library". The currently open project is loaded
 * from here into the in-memory {@link FileSystem} working copy and saved back
 * as the user edits.
 */
export interface ProjectRecord {
  /** Stable project identifier. */
  id: string;
  /** User-visible project name. */
  name: string;
  /** File content keyed by filename, base64 encoded (as in PythonProject). */
  files: Record<string, string>;
  /** Last modified time, milliseconds since the epoch. */
  timestamp: number;
}

const DB_NAME = "python-editor";
const DB_VERSION = 1;
const PROJECTS_STORE = "projects";

interface Schema extends DBSchema {
  [PROJECTS_STORE]: {
    key: string;
    value: ProjectRecord;
  };
}

/**
 * Data access layer for the multi-project store.
 */
export class ProjectsDatabase {
  private dbPromise: Promise<IDBPDatabase<Schema>> | undefined;

  private db(): Promise<IDBPDatabase<Schema>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<Schema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          db.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
        },
      });
    }
    return this.dbPromise;
  }

  async getAll(): Promise<ProjectRecord[]> {
    const db = await this.db();
    return db.getAll(PROJECTS_STORE);
  }

  async get(id: string): Promise<ProjectRecord | undefined> {
    const db = await this.db();
    return db.get(PROJECTS_STORE, id);
  }

  async put(record: ProjectRecord): Promise<void> {
    const db = await this.db();
    await db.put(PROJECTS_STORE, record);
  }

  async delete(id: string): Promise<void> {
    const db = await this.db();
    await db.delete(PROJECTS_STORE, id);
  }
}

export const projectsDb = new ProjectsDatabase();
