/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import "fake-indexeddb/auto";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { MockLogging } from "../logging/mock";
import {
  chooseProject,
  getCurrentProjectId,
  openProjectsDatabase,
  setCurrentProjectId,
} from "./current-project";
import { MAIN_FILE } from "./fs";
import { databaseName, ProjectsDatabase } from "./projects-db";
import { SessionStorageFSStorage } from "./storage";
import {
  hasStorageVersionError,
  resetStorageStatus,
  useProjectsDatabaseActive,
} from "./storage-status";

const deleteDatabase = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName());
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error("deleteDatabase failed"));
  });

const encode = (text: string) => new TextEncoder().encode(text);
const isActive = () =>
  renderHook(() => useProjectsDatabaseActive()).result.current;

describe("openProjectsDatabase", () => {
  let logging: MockLogging;
  beforeEach(async () => {
    await deleteDatabase();
    logging = new MockLogging();
    resetStorageStatus();
  });

  it("opens the database and reports it active", async () => {
    const db = await openProjectsDatabase(logging);
    expect(db).toBeInstanceOf(ProjectsDatabase);
    expect(isActive()).toEqual(true);
    db!.close();
  });

  it("gives up and logs when the database cannot be opened", async () => {
    vi.spyOn(ProjectsDatabase, "open").mockRejectedValueOnce(
      new Error("blocked")
    );
    expect(await openProjectsDatabase(logging)).toBeUndefined();
    expect(logging.errors[0].message).toMatch(/using session storage/);
    expect(isActive()).toEqual(false);
  });

  it("gives up quietly on an incompatible database on public stages", async () => {
    vi.spyOn(ProjectsDatabase, "open").mockRejectedValueOnce(
      new DOMException("nope", "VersionError")
    );
    expect(await openProjectsDatabase(logging, true)).toBeUndefined();
    expect(hasStorageVersionError()).toEqual(false);
    expect(logging.errors).toHaveLength(1);
  });

  it("reports an incompatible database for clearing on non-public stages", async () => {
    vi.spyOn(ProjectsDatabase, "open").mockRejectedValueOnce(
      new DOMException("nope", "VersionError")
    );
    expect(await openProjectsDatabase(logging, false)).toBeUndefined();
    expect(logging.errors).toEqual([]);
    expect(hasStorageVersionError()).toEqual(true);
  });

  it("gives up without IndexedDB", async () => {
    const original = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", {
      value: undefined,
      configurable: true,
    });
    try {
      expect(await openProjectsDatabase(logging)).toBeUndefined();
    } finally {
      Object.defineProperty(globalThis, "indexedDB", {
        value: original,
        configurable: true,
      });
    }
  });
});

describe("chooseProject", () => {
  let counter = 0;
  let db: ProjectsDatabase;
  beforeEach(async () => {
    sessionStorage.clear();
    db = await ProjectsDatabase.open(`choose-${Date.now()}-${counter++}`);
  });
  afterEach(() => db.close());

  it("creates a project with the starter program when there is nothing", async () => {
    const id = await chooseProject(db, sessionStorage);
    expect(getCurrentProjectId(sessionStorage)).toEqual(id);
    expect((await db.list()).map((p) => p.id)).toEqual([id]);
    expect(await db.fileNames(id)).toEqual([MAIN_FILE]);
  });

  it("reopens the tab's current project and marks it most recent", async () => {
    await db.create({ id: "old", name: "Old", timestamp: 1 }, {});
    await db.create({ id: "cur", name: "Cur", timestamp: 2 }, {});
    await db.touch("old", 3);
    setCurrentProjectId(sessionStorage, "cur");

    expect(await chooseProject(db, sessionStorage)).toEqual("cur");
    expect((await db.mostRecent())?.id).toEqual("cur");
  });

  it("opens the most recent project when the tab has none", async () => {
    await db.create({ id: "old", name: "Old", timestamp: 1 }, {});
    await db.create({ id: "recent", name: "Recent", timestamp: 2 }, {});

    expect(await chooseProject(db, sessionStorage)).toEqual("recent");
    expect(getCurrentProjectId(sessionStorage)).toEqual("recent");
  });

  it("falls back to the most recent when the tab's project is gone", async () => {
    await db.create({ id: "recent", name: "Recent", timestamp: 2 }, {});
    setCurrentProjectId(sessionStorage, "deleted");

    expect(await chooseProject(db, sessionStorage)).toEqual("recent");
  });

  it("migrates a project from session storage ahead of anything else", async () => {
    await db.create({ id: "recent", name: "Recent", timestamp: 2 }, {});
    const legacy = new SessionStorageFSStorage(sessionStorage);
    await legacy.write("main.py", encode("# mine"));
    await legacy.write("helper.py", encode("# helper"));
    await legacy.setProjectName("My project");
    sessionStorage.setItem("unrelated", "kept");

    const id = await chooseProject(db, sessionStorage);

    expect(id).not.toEqual("recent");
    expect((await db.get(id))?.name).toEqual("My project");
    expect(await db.fileNames(id)).toEqual(["helper.py", "main.py"]);
    expect(Array.from((await db.file(id, "main.py"))!)).toEqual(
      Array.from(encode("# mine"))
    );
    expect(await legacy.ls()).toEqual([]);
    expect(sessionStorage.getItem("unrelated")).toEqual("kept");
    expect(getCurrentProjectId(sessionStorage)).toEqual(id);
  });
});
