/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FileChanges, ProjectMeta, ProjectsDatabase } from "./projects-db";
import { FSStorage } from "./storage";

const defaultFlushDelayMs = 300;

/**
 * File system storage for one project in the IndexedDB projects database.
 *
 * Intended as the secondary of a SplitStrategyStorage, so reads are rare and
 * writes arrive on every keystroke. Writes are coalesced per file and flushed
 * as one transaction after a short delay, and when the page is hidden or
 * unloading. Reads flush first so they always see the latest write.
 *
 * A flush never reads: see ProjectsDatabase.save for why. So this holds the
 * project's name, the one part of its record that a flush does not itself
 * decide, from when the project is opened. Another tab changing it is told
 * to this one by Projects, which opens the project afresh.
 *
 * Failures never propagate: the in-memory primary still holds the content,
 * so a failed flush is reported through onError and the changes are dropped
 * rather than retried forever against, say, a full quota.
 *
 * The dirty flag is not stored: it exists to warn before work is lost, and
 * a project in the database outlives the tab.
 */
export class IndexedDBFSStorage implements FSStorage {
  private readonly projectId: string;
  private name: string | undefined;
  // The name was set here and has not been flushed yet.
  private nameUnsaved = false;
  private pendingWrites = new Map<string, Uint8Array | null>();
  // When the oldest pending change was made, or undefined with nothing to
  // flush: the project's "last modified" is the edit, not the flush, which
  // may come later than another project's.
  private pendingSince: number | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private flushing: Promise<void> = Promise.resolve();
  private abandoned = false;
  // What a failed flush left out of the database and no flush has written
  // since: files by name, and the project record.
  private unsavedFiles = new Set<string>();
  private unsavedRecord = false;
  private readonly handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      void this.flush({ urgent: true });
    }
  };
  // Not every browser reports the page as hidden by the time of pagehide.
  private readonly handlePageHide = () => void this.flush({ urgent: true });

  /**
   * @param project The project's record as it is in the database now.
   * @param onError Reports a failed flush; the changes in it are dropped.
   * @param onChange Called after a successful flush, for cross-tab sync.
   */
  constructor(
    private db: ProjectsDatabase,
    project: ProjectMeta,
    private onError: (e: unknown) => void,
    private onChange: () => void = () => {},
    private flushDelayMs: number = defaultFlushDelayMs
  ) {
    this.projectId = project.id;
    this.name = project.name;
    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
      window.addEventListener("pagehide", this.handlePageHide);
    }
  }

  /**
   * Flushes and stops listening. The database connection is shared with
   * the projects list and stays open.
   */
  async dispose(): Promise<void> {
    this.stopListening();
    await this.flush();
  }

  /**
   * For a project that has been deleted: drops what is pending and ignores
   * writes from here on, so that an editor still showing the project cannot
   * write it back.
   */
  abandon(): void {
    this.abandoned = true;
    this.stopListening();
    clearTimeout(this.timer);
    this.timer = undefined;
    this.pendingWrites = new Map();
    this.pendingSince = undefined;
    this.unsavedFiles = new Set();
    this.unsavedRecord = false;
  }

  /**
   * True while a failed flush has left something out of the database, so
   * that closing the tab now would lose it. A failed flush is not retried,
   * so this lasts until the same files are next written successfully.
   */
  get hasUnsavedChanges(): boolean {
    return this.unsavedFiles.size > 0 || this.unsavedRecord;
  }

  /**
   * Takes the project's name as another tab has saved it. A flush writes
   * the name held here, so without this one that is still to come would
   * undo the other tab's rename. A rename made here and not yet flushed is
   * kept: it is the later of the two.
   */
  adoptName(name: string | undefined): void {
    if (!this.nameUnsaved) {
      this.name = name;
    }
  }

  private stopListening(): void {
    if (typeof document !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
      window.removeEventListener("pagehide", this.handlePageHide);
    }
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
    this.name = undefined;
    this.nameUnsaved = true;
    this.schedule();
    await this.flush();
  }

  async setProjectName(projectName: string | undefined): Promise<void> {
    this.name = projectName;
    this.nameUnsaved = true;
    this.schedule();
  }

  async projectName(): Promise<string | undefined> {
    return this.name;
  }

  async markDirty(): Promise<void> {}

  async clearDirty(): Promise<void> {}

  async isDirty(): Promise<boolean> {
    return false;
  }

  private schedule(): void {
    if (this.abandoned) {
      this.pendingWrites = new Map();
      return;
    }
    this.pendingSince ??= Date.now();
    if (this.timer === undefined) {
      this.timer = setTimeout(() => void this.flush(), this.flushDelayMs);
    }
  }

  /**
   * Writes everything pending in one transaction. Safe to call at any time.
   *
   * The transaction's requests are issued before this returns, which an
   * urgent flush needs to stand a chance as the page unloads, and it runs
   * after those of earlier flushes, so the latest content is what is kept.
   * An earlier flush that is still in flight when the page unloads is not
   * helped by a later urgent one: only the urgent one commits explicitly.
   *
   * @param urgent The page may be about to go away; see
   * ProjectsDatabase.save.
   * @returns A promise that resolves when this flush and those before it
   * have finished, whether or not they succeeded.
   */
  flush({ urgent = false }: { urgent?: boolean } = {}): Promise<void> {
    clearTimeout(this.timer);
    this.timer = undefined;
    if (this.pendingSince === undefined) {
      return this.flushing;
    }
    const project: ProjectMeta = {
      id: this.projectId,
      name: this.name,
      timestamp: this.pendingSince,
    };
    const files: FileChanges = { writes: {}, deletes: [] };
    for (const [name, data] of this.pendingWrites) {
      if (data === null) {
        files.deletes.push(name);
      } else {
        files.writes[name] = data;
      }
    }
    this.pendingWrites = new Map();
    this.pendingSince = undefined;
    this.nameUnsaved = false;
    const names = [...Object.keys(files.writes), ...files.deletes];
    const saved = this.db
      .save(project, files, { urgent })
      .then(
        () => {
          names.forEach((name) => this.unsavedFiles.delete(name));
          // Every flush writes the whole record.
          this.unsavedRecord = false;
        },
        (e) => {
          names.forEach((name) => this.unsavedFiles.add(name));
          this.unsavedRecord = true;
          throw e;
        }
      )
      .then(() => this.onChange())
      .catch((e) => this.onError(e));
    const earlier = this.flushing;
    this.flushing = earlier.then(() => saved);
    return this.flushing;
  }
}
