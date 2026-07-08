/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { DBSchema, IDBPDatabase, openDB } from "idb";

/**
 * Project metadata. Cheap to list — deliberately does NOT hold file content.
 */
export interface ProjectData {
  id: string;
  name: string;
  timestamp: number;
}

/**
 * A single file belonging to a project. Files are owned by their project and
 * keyed by [projectId, name] — the name is a file's identity within a project,
 * so no separate file id is needed.
 */
export interface FileRecord {
  projectId: string;
  name: string;
  /** File content as base64 (as in PythonProject). */
  data: string;
}

/**
 * Project metadata plus its file names (but not content) — enough to render the
 * home/projects list and search, without loading any file data.
 */
export interface ProjectDataWithFiles extends ProjectData {
  fileNames: string[];
}

/** A project's metadata and full file contents. */
export interface ProjectWithFiles {
  meta: ProjectData;
  /** File content keyed by filename, base64 encoded. */
  files: Record<string, string>;
}

const DB_NAME = "python-editor";
const DB_VERSION = 1;
const PROJECTS = "projects";
const FILES = "files";

interface Schema extends DBSchema {
  [PROJECTS]: {
    key: string;
    value: ProjectData;
  };
  [FILES]: {
    key: [string, string];
    value: FileRecord;
    indexes: { projectId: string };
  };
}

/**
 * Data access layer for the multi-project store.
 *
 * Projects own their files: metadata lives in the `projects` store and file
 * content in a separate `files` store (keyed by [projectId, name], indexed by
 * projectId). This keeps project listing cheap and lets us persist a single
 * changed file without rewriting the whole project.
 */
export class ProjectsDatabase {
  private dbPromise: Promise<IDBPDatabase<Schema>> | undefined;

  private db(): Promise<IDBPDatabase<Schema>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<Schema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          db.createObjectStore(PROJECTS, { keyPath: "id" });
          const files = db.createObjectStore(FILES, {
            keyPath: ["projectId", "name"],
          });
          files.createIndex("projectId", "projectId");
        },
      });
    }
    return this.dbPromise;
  }

  /** Project metadata + file names for every project (no file content). */
  async getAllProjectData(): Promise<ProjectDataWithFiles[]> {
    const db = await this.db();
    const [metas, fileKeys] = await Promise.all([
      db.getAll(PROJECTS),
      db.getAllKeys(FILES),
    ]);
    const namesByProject = new Map<string, string[]>();
    for (const [projectId, name] of fileKeys) {
      const names = namesByProject.get(projectId);
      if (names) {
        names.push(name);
      } else {
        namesByProject.set(projectId, [name]);
      }
    }
    return metas.map((meta) => ({
      ...meta,
      fileNames: namesByProject.get(meta.id) ?? [],
    }));
  }

  async getProjectData(id: string): Promise<ProjectData | undefined> {
    const db = await this.db();
    return db.get(PROJECTS, id);
  }

  /** A project's metadata and full file contents, or undefined if missing. */
  async getProject(id: string): Promise<ProjectWithFiles | undefined> {
    const db = await this.db();
    const meta = await db.get(PROJECTS, id);
    if (!meta) {
      return undefined;
    }
    const fileRecords = await db.getAllFromIndex(FILES, "projectId", id);
    const files: Record<string, string> = {};
    for (const file of fileRecords) {
      files[file.name] = file.data;
    }
    return { meta, files };
  }

  async putProjectData(meta: ProjectData): Promise<void> {
    const db = await this.db();
    await db.put(PROJECTS, meta);
  }

  /** Create a project and all its files atomically. */
  async createProject(
    meta: ProjectData,
    files: Record<string, string>
  ): Promise<void> {
    const db = await this.db();
    const tx = db.transaction([PROJECTS, FILES], "readwrite");
    await tx.objectStore(PROJECTS).put(meta);
    const filesStore = tx.objectStore(FILES);
    for (const [name, data] of Object.entries(files)) {
      await filesStore.put({ projectId: meta.id, name, data });
    }
    await tx.done;
  }

  /**
   * Persist a change to a project: update metadata, write changed files and
   * delete removed ones — all in one transaction. Only touched files are
   * written.
   */
  async saveProject(
    meta: ProjectData,
    changedFiles: FileRecord[],
    deletedFileNames: string[]
  ): Promise<void> {
    const db = await this.db();
    const tx = db.transaction([PROJECTS, FILES], "readwrite");
    await tx.objectStore(PROJECTS).put(meta);
    const filesStore = tx.objectStore(FILES);
    for (const file of changedFiles) {
      await filesStore.put(file);
    }
    for (const name of deletedFileNames) {
      await filesStore.delete([meta.id, name]);
    }
    await tx.done;
  }

  async duplicateProject(
    sourceId: string,
    newMeta: ProjectData
  ): Promise<void> {
    const source = await this.getProject(sourceId);
    if (!source) {
      return;
    }
    await this.createProject(newMeta, source.files);
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.db();
    const tx = db.transaction([PROJECTS, FILES], "readwrite");
    await tx.objectStore(PROJECTS).delete(id);
    let cursor = await tx
      .objectStore(FILES)
      .index("projectId")
      .openCursor(IDBKeyRange.only(id));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}

export const projectsDb = new ProjectsDatabase();
