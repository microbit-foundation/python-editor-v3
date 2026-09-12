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
import { ProjectListEntry, ProjectsDatabase } from "../fs/projects-db";
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

interface EventMap {
  change: ProjectsChangedEvent;
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
  private opening: Promise<void> | undefined;
  private cachedList: ProjectListEntry[] = [];
  private readonly channel: BroadcastChannel | undefined;
  private readonly session = sessionStorageIfPossible();

  /**
   * @param firstStorage Resolved with the file system's persistent storage
   * when a project is first opened; the host's DefaultHost waits on it.
   */
  constructor(
    private fs: FileSystem,
    private logging: Logging,
    db: Promise<ProjectsDatabase | undefined>,
    private firstStorage: Deferred<FSStorage | undefined>
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
   * Makes sure the editor has a project: the one already open, else the
   * tab's, the most recent, or a new one. For the editor route's loader.
   * Concurrent calls share one choice so they cannot each create a project.
   */
  openCurrent(): Promise<void> {
    this.opening ??= this.chooseAndOpen().finally(() => {
      this.opening = undefined;
    });
    return this.opening;
  }

  private async chooseAndOpen(): Promise<void> {
    await this.ready;
    if (!this.db) {
      this.resolveFirstStorage(
        hasStorageVersionError() ? undefined : SessionStorageFSStorage.create()
      );
      return;
    }
    if (this.openId && (await this.db.get(this.openId))) {
      return;
    }
    await this.switchTo(await chooseProject(this.db, this.session));
  }

  async open(id: string): Promise<void> {
    const db = await this.requireDb();
    if (!(await db.get(id))) {
      throw new Error(`No such project ${id}`);
    }
    await db.touch(id);
    await this.switchTo(id);
  }

  async create(name: string): Promise<string> {
    const db = await this.requireDb();
    const id = generateId();
    await db.create({ id, name, timestamp: Date.now() }, defaultProjectFiles());
    await this.switchTo(id);
    await this.changed([id]);
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

  private resolveFirstStorage(storage: FSStorage | undefined): void {
    if (!this.firstStorageResolved) {
      this.firstStorageResolved = true;
      this.firstStorage.resolve(storage);
    }
  }

  /**
   * Points the file system at a project. The first time this supplies the
   * storage the host is waiting for; afterwards it switches.
   */
  private async switchTo(id: string): Promise<void> {
    const db = await this.requireDb();
    const previous = this.openStorage;
    const indexed = new IndexedDBFSStorage(
      db,
      id,
      (e) => this.logging.error("Failed to save project", e),
      () => this.channel?.postMessage({ type: "changed", projectIds: [id] })
    );
    const storage = new SplitStrategyStorage(
      new InMemoryFSStorage(undefined),
      indexed,
      this.logging
    );
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
        // Reload the open project so this tab shows the other's edits.
        const id = this.openId;
        this.openId = undefined;
        await this.switchTo(id);
      }
    })();
  };
}
