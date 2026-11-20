/**
 * The projects database in IndexedDB.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { DBSchema, IDBPDatabase, openDB, unwrap } from "idb";
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

/** A project as listed on the pages: its metadata plus what it contains. */
export interface ProjectListEntry extends ProjectMeta {
  fileNames: string[];
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
 * Changes to a project's files.
 */
export interface FileChanges {
  writes: Record<string, Uint8Array>;
  deletes: string[];
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

  /**
   * All projects with their file names, most recent first. One transaction
   * over both stores so the list is consistent and costs two reads, not one
   * per project.
   */
  async listWithFileNames(): Promise<ProjectListEntry[]> {
    const tx = this.db.transaction(stores, "readonly");
    const [projects, fileKeys] = await Promise.all([
      tx.objectStore(PROJECTS).getAll(),
      tx.objectStore(FILES).getAllKeys(),
      tx.done,
    ]);
    const filesByProject = new Map<string, string[]>();
    for (const [projectId, name] of fileKeys) {
      const names = filesByProject.get(projectId) ?? [];
      names.push(name);
      filesByProject.set(projectId, names);
    }
    return projects
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((p) => ({ ...p, fileNames: filesByProject.get(p.id) ?? [] }));
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

  /**
   * Changes a project's record, keeping the fields not given. For changes
   * made from the pages; the open project is written by save().
   */
  async update(
    id: string,
    changes: Partial<Omit<ProjectMeta, "id">>
  ): Promise<void> {
    const tx = this.db.transaction(PROJECTS, "readwrite");
    const existing = await tx.store.get(id);
    if (!existing) {
      throw new Error(`No such project ${id}`);
    }
    await tx.store.put({ ...existing, ...changes, id });
    await tx.done;
  }

  /**
   * Writes a project's record and file changes in one transaction.
   *
   * Every request is issued before this returns and none depends on a read,
   * because a write that waits for a read is lost when the page unloads: an
   * unloading page gets no further turns of the event loop. The caller
   * supplies the whole record for the same reason.
   *
   * @param urgent The page may be about to go away, so commit at once
   * rather than when the requests have finished. This gives up the check
   * that the project still exists, which needs the result of a read, so a
   * project deleted in the meantime is written back.
   * @throws if the project no longer exists (unless urgent), leaving
   * nothing written.
   */
  save(
    project: ProjectMeta,
    { writes, deletes }: FileChanges,
    { urgent = false }: { urgent?: boolean } = {}
  ): Promise<void> {
    // The plain transaction, not idb's wrapper: its promise of completion
    // would be an unhandled rejection on the abort below.
    const tx = unwrap(this.db).transaction(stores, "readwrite");
    return new Promise((resolve, reject) => {
      let missing = false;
      tx.oncomplete = () => resolve();
      tx.onabort = () =>
        reject(
          missing
            ? new Error(`No such project ${project.id}`)
            : tx.error ?? new DOMException("Transaction aborted", "AbortError")
        );
      try {
        const projects = tx.objectStore(PROJECTS);
        if (!urgent) {
          const existing = projects.getKey(project.id);
          existing.onsuccess = () => {
            if (existing.result === undefined) {
              missing = true;
              tx.abort();
            }
          };
        }
        projects.put(project);
        const fileStore = tx.objectStore(FILES);
        for (const [name, data] of Object.entries(writes)) {
          fileStore.put({ projectId: project.id, name, data });
        }
        for (const name of deletes) {
          fileStore.delete([project.id, name]);
        }
        // Missing from Safari before 15, where the transaction commits once
        // its requests finish, if the page lasts that long.
        if (urgent && "commit" in tx) {
          tx.commit();
        }
      } catch (e) {
        // A request that could not even be made, such as data that cannot
        // be stored. Without this the requests before it would commit.
        tx.abort();
        throw e;
      }
    });
  }

  /** Marks a project as the most recent. */
  async touch(id: string, timestamp: number = Date.now()): Promise<void> {
    await this.update(id, { timestamp });
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
