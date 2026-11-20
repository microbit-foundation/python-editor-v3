/**
 * The projects in this browser and which one the editor has open.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Deferred } from "../common/deferred";
import { TypedEventTarget } from "../common/events";
import {
  chooseProject,
  defaultProjectFiles,
  getCurrentProjectId,
  sessionStorageIfPossible,
  setCurrentProjectId,
} from "../fs/current-project";
import { FileSystem } from "../fs/fs";
import { generateId } from "../fs/fs-util";
import { IndexedDBFSStorage } from "../fs/indexeddb-storage";
import { PendingMigration } from "../fs/migration";
import {
  ProjectContent,
  ProjectListEntry,
  ProjectsDatabase,
} from "../fs/projects-db";
import {
  FSStorage,
  InMemoryFSStorage,
  SessionStorageFSStorage,
  SplitStrategyStorage,
} from "../fs/storage";
import { hasStorageVersionError } from "../fs/storage-status";
import { Logging } from "../logging/logging";

export class ProjectsChangedEvent extends Event {
  constructor() {
    super("change");
  }
}

/** A write to the open project's storage failed; its changes were dropped. */
export class ProjectSaveErrorEvent extends Event {
  constructor(public readonly error: unknown) {
    super("saveerror");
  }
}

interface EventMap {
  change: ProjectsChangedEvent;
  saveerror: ProjectSaveErrorEvent;
}

/**
 * What other tabs are told. Ids name the projects affected; a tab with one of
 * them open reloads or lets go of it.
 */
interface SyncMessage {
  type: "changed" | "deleted";
  projectIds: string[];
}

const syncChannelName = "python-editor-projects";

/**
 * Lists, creates, opens, renames, duplicates and deletes projects, and keeps
 * the file system on the open one.
 *
 * The host waits on the file system's first storage, which this resolves
 * when a project is first opened, so the pages can show without choosing a
 * project. Later opens switch the file system's storage. Without the
 * projects database the editor falls back to session storage and there is
 * nothing to list; pages redirect to the editor.
 */
export class Projects extends TypedEventTarget<EventMap> {
  private db: ProjectsDatabase | undefined;
  private readonly ready: Promise<void>;
  private firstStorageResolved = false;
  private openId: string | undefined;
  private openStorage: IndexedDBFSStorage | undefined;
  private opening: Promise<boolean> | undefined;
  private openFailure: unknown;
  private cachedList: ProjectListEntry[] = [];
  private saveErrorReported = false;
  private readonly channel: BroadcastChannel | undefined;
  private readonly session = sessionStorageIfPossible();

  /**
   * @param firstStorage Resolved with the file system's storage when a
   * project is first opened; the host's DefaultHost waits on it.
   * @param migration The #project: link at boot, made a new project when
   * the editor first chooses one. Left for the host without the database.
   */
  constructor(
    private fs: FileSystem,
    private logging: Logging,
    db: Promise<ProjectsDatabase | undefined>,
    private firstStorage: Deferred<FSStorage>,
    private migration: PendingMigration = new PendingMigration("")
  ) {
    super();
    this.ready = db.then((resolved) => {
      this.db = resolved;
    });
    this.channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(syncChannelName)
        : undefined;
    this.channel?.addEventListener("message", this.handleSyncMessage);
  }

  /**
   * False without the projects database, in which case there is one
   * implicit project and no project management.
   */
  async isAvailable(): Promise<boolean> {
    await this.ready;
    return this.db !== undefined;
  }

  /**
   * The projects as of the last refresh, most recent first. Route loaders
   * refresh before the pages render; the pages then subscribe to changes.
   */
  get projects(): ProjectListEntry[] {
    return this.cachedList;
  }

  /** The project the editor has open in this tab, if any. */
  get currentId(): string | undefined {
    return this.openId;
  }

  async refresh(): Promise<ProjectListEntry[]> {
    await this.ready;
    this.cachedList = this.db ? await this.db.listWithFileNames() : [];
    this.dispatchTypedEvent("change", new ProjectsChangedEvent());
    return this.cachedList;
  }

  /**
   * Makes sure the editor has a project: one from the #project: link the
   * app booted with, else the one already open, the tab's, the most recent,
   * or a new one. For the editor route's loader. Concurrent calls share one
   * choice so they cannot each create a project.
   *
   * @returns True if a #project: link became a project, so the caller can
   * drop the hash from the URL.
   * @throws If the project fails to load. The error is also kept for
   * takeOpenFailure.
   */
  openCurrent(): Promise<boolean> {
    if (!this.opening) {
      this.openFailure = undefined;
      this.opening = this.chooseAndOpen()
        .catch((error: unknown) => {
          this.openFailure = error;
          throw error;
        })
        .finally(() => {
          this.opening = undefined;
        });
    }
    return this.opening;
  }

  /**
   * Why the last openCurrent failed, if it did, for the page the editor
   * redirects to to report. Cleared once taken or by the next openCurrent.
   */
  takeOpenFailure(): unknown {
    const failure = this.openFailure;
    this.openFailure = undefined;
    return failure;
  }

  private async chooseAndOpen(): Promise<boolean> {
    await this.ready;
    if (!this.db) {
      this.resolveFirstStorage(
        new SplitStrategyStorage(
          new InMemoryFSStorage(undefined),
          hasStorageVersionError()
            ? undefined
            : SessionStorageFSStorage.create(),
          this.logging
        )
      );
      return false;
    }
    const migration = this.migration.take();
    if (!migration && this.openId && (await this.db.get(this.openId))) {
      return false;
    }
    const id = await chooseProject(this.db, this.session, migration);
    await this.switchTo(id);
    if (migration) {
      await this.changed([id]);
    }
    return migration !== undefined;
  }

  async open(id: string): Promise<void> {
    const db = await this.requireDb();
    await this.switchTo(id);
    await db.touch(id);
  }

  async create(name: string): Promise<string> {
    return this.createFromFiles(name, defaultProjectFiles());
  }

  /**
   * Creates a project with the given files, e.g. from an imported hex or an
   * idea, and opens it in the editor.
   *
   * Leaves this tab's list alone: the caller is heading to the editor, and
   * a refresh could show the new card on the page first. The pages refresh
   * when next visited.
   */
  async createFromFiles(
    name: string | undefined,
    files: Record<string, Uint8Array>
  ): Promise<string> {
    const db = await this.requireDb();
    const id = generateId();
    const meta = { id, name, timestamp: Date.now() };
    await db.create(meta, files);
    await this.switchTo(id, { meta, files });
    this.channel?.postMessage({ type: "changed", projectIds: [id] });
    return id;
  }

  async rename(id: string, name: string): Promise<void> {
    const db = await this.requireDb();
    if (id === this.openId) {
      // Through the file system so its copy of the name changes too.
      await this.fs.setProjectName(name);
      await this.openStorage?.flush();
    } else {
      await db.apply(id, { meta: { name, timestamp: Date.now() } });
    }
    await this.changed([id]);
  }

  async duplicate(id: string, name: string): Promise<string> {
    const db = await this.requireDb();
    if (id === this.openId) {
      await this.openStorage?.flush();
    }
    const newId = generateId();
    await db.duplicate(id, { id: newId, name, timestamp: Date.now() });
    await this.changed([newId]);
    return newId;
  }

  async delete(ids: string[]): Promise<void> {
    const db = await this.requireDb();
    for (const id of ids) {
      if (id === this.openId) {
        this.letGoOfOpenProject();
      }
      await db.delete(id);
    }
    await this.refresh();
    this.channel?.postMessage({ type: "deleted", projectIds: ids });
  }

  private async requireDb(): Promise<ProjectsDatabase> {
    await this.ready;
    if (!this.db) {
      throw new Error("The projects database is not available");
    }
    return this.db;
  }

  private resolveFirstStorage(storage: FSStorage): void {
    if (!this.firstStorageResolved) {
      this.firstStorageResolved = true;
      this.firstStorage.resolve(storage);
    }
  }

  /**
   * Points the file system at a project. The first time this supplies the
   * storage the host is waiting for; afterwards it switches. Loads the
   * project before changing anything, so a failed read leaves all as it was.
   *
   * @param created A project's content when it was just created, to skip
   * reading it back.
   */
  private async switchTo(id: string, created?: ProjectContent): Promise<void> {
    const db = await this.requireDb();
    const content = created ?? (await db.load(id));
    if (!content) {
      throw new Error(`No such project ${id}`);
    }
    const primary = new InMemoryFSStorage(content.meta.name);
    for (const [name, data] of Object.entries(content.files)) {
      await primary.write(name, data);
    }
    const previous = this.openStorage;
    const indexed = new IndexedDBFSStorage(
      db,
      id,
      (e) => this.handleSaveError(e),
      () => this.channel?.postMessage({ type: "changed", projectIds: [id] })
    );
    const storage = new SplitStrategyStorage(primary, indexed, this.logging, {
      preloaded: true,
    });
    this.openId = id;
    this.openStorage = indexed;
    setCurrentProjectId(this.session, id);
    if (this.firstStorageResolved) {
      await this.fs.switchStorage(storage);
    } else {
      this.resolveFirstStorage(storage);
    }
    await previous?.dispose();
  }

  /**
   * The open project is gone. Its storage is left in place until the editor
   * next asks for a project; nothing writes to it from the pages.
   */
  private letGoOfOpenProject(): void {
    this.openId = undefined;
    this.openStorage = undefined;
    if (getCurrentProjectId(this.session)) {
      setCurrentProjectId(this.session, undefined);
    }
  }

  /**
   * Writes are per keystroke, so once storage is full every flush fails;
   * report the first so Sentry sees it and leave the toast to say the rest.
   */
  private handleSaveError(error: unknown): void {
    if (!this.saveErrorReported) {
      this.saveErrorReported = true;
      this.logging.error("Failed to save project", error);
    }
    this.dispatchTypedEvent("saveerror", new ProjectSaveErrorEvent(error));
  }

  private async changed(ids: string[]): Promise<void> {
    await this.refresh();
    this.channel?.postMessage({ type: "changed", projectIds: ids });
  }

  private handleSyncMessage = (event: MessageEvent<SyncMessage>) => {
    void (async () => {
      const { type, projectIds } = event.data;
      await this.refresh();
      if (!this.openId || !projectIds.includes(this.openId)) {
        return;
      }
      if (type === "deleted") {
        this.letGoOfOpenProject();
      } else if (this.db) {
        // Reload the open project so this tab shows the other's edits. If
        // that fails, carry on with this tab's copy.
        const id = this.openId;
        this.openId = undefined;
        try {
          await this.switchTo(id);
        } catch (e) {
          // Unless the user opened another project meanwhile.
          this.openId ??= id;
          this.logging.error("Failed to reload project", e);
        }
      }
    })();
  };
}
