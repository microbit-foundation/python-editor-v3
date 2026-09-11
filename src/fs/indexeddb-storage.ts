/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ProjectChanges, ProjectsDatabase } from "./projects-db";
import { FSStorage } from "./storage";

const defaultFlushDelayMs = 300;

/**
 * File system storage for one project in the IndexedDB library.
 *
 * Intended as the secondary of a SplitStrategyStorage, so reads are rare and
 * writes arrive on every keystroke. Writes are coalesced per file and flushed
 * as one transaction after a short delay, and when the page is hidden or
 * unloading. Reads flush first so they always see the latest write.
 *
 * Failures never propagate: the in-memory primary still holds the content,
 * so a failed flush is reported through onError and the changes are dropped
 * rather than retried forever against, say, a full quota.
 */
export class IndexedDBFSStorage implements FSStorage {
  private pendingWrites = new Map<string, Uint8Array | null>();
  private pendingMeta: NonNullable<ProjectChanges["meta"]> = {};
  private timer: ReturnType<typeof setTimeout> | undefined;
  private flushing: Promise<void> = Promise.resolve();
  private readonly handleHidden = () => {
    if (document.visibilityState === "hidden") {
      void this.flush();
    }
  };

  constructor(
    private db: ProjectsDatabase,
    private projectId: string,
    private onError: (e: unknown) => void,
    private flushDelayMs: number = defaultFlushDelayMs
  ) {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleHidden);
      window.addEventListener("pagehide", this.handleHidden);
    }
  }

  /** Flushes, stops listening and closes the database. */
  async dispose(): Promise<void> {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleHidden);
      window.removeEventListener("pagehide", this.handleHidden);
    }
    await this.flush();
    this.db.close();
  }

  async ls(): Promise<string[]> {
    await this.flush();
    return this.db.fileNames(this.projectId);
  }

  async exists(filename: string): Promise<boolean> {
    await this.flush();
    return (await this.db.file(this.projectId, filename)) !== undefined;
  }

  async read(filename: string): Promise<Uint8Array> {
    await this.flush();
    const data = await this.db.file(this.projectId, filename);
    if (data === undefined) {
      throw new Error(`No such file ${filename}`);
    }
    return data;
  }

  async write(name: string, content: Uint8Array): Promise<void> {
    this.pendingWrites.set(name, content);
    this.schedule();
  }

  async remove(name: string): Promise<void> {
    this.pendingWrites.set(name, null);
    this.schedule();
  }

  async clear(): Promise<void> {
    for (const name of await this.ls()) {
      this.pendingWrites.set(name, null);
    }
    this.pendingMeta = { name: undefined, dirty: false };
    await this.flush();
  }

  async setProjectName(projectName: string | undefined): Promise<void> {
    this.pendingMeta.name = projectName;
    this.schedule();
  }

  async projectName(): Promise<string | undefined> {
    await this.flush();
    return (await this.db.get(this.projectId))?.name;
  }

  async markDirty(): Promise<void> {
    this.pendingMeta.dirty = true;
    this.schedule();
  }

  async clearDirty(): Promise<void> {
    this.pendingMeta.dirty = false;
    this.schedule();
  }

  async isDirty(): Promise<boolean> {
    await this.flush();
    return (await this.db.get(this.projectId))?.dirty ?? false;
  }

  private schedule(): void {
    if (this.timer === undefined) {
      this.timer = setTimeout(() => void this.flush(), this.flushDelayMs);
    }
  }

  /**
   * Writes everything pending in one transaction. Safe to call at any time;
   * concurrent calls queue behind each other.
   */
  flush(): Promise<void> {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.flushing = this.flushing.then(() => this.flushPending());
    return this.flushing;
  }

  private async flushPending(): Promise<void> {
    if (this.pendingWrites.size === 0 && isEmpty(this.pendingMeta)) {
      return;
    }
    const writes: Record<string, Uint8Array> = {};
    const deletes: string[] = [];
    for (const [name, data] of this.pendingWrites) {
      if (data === null) {
        deletes.push(name);
      } else {
        writes[name] = data;
      }
    }
    const changes: ProjectChanges = {
      meta: { ...this.pendingMeta, timestamp: Date.now() },
      writes,
      deletes,
    };
    this.pendingWrites = new Map();
    this.pendingMeta = {};
    try {
      await this.db.apply(this.projectId, changes);
    } catch (e) {
      this.onError(e);
    }
  }
}

const isEmpty = (o: object) => Object.keys(o).length === 0;
