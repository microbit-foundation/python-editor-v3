/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import "fake-indexeddb/auto";
import { vi } from "vitest";
import { MockLogging } from "../logging/mock";
import {
  getCurrentProjectId,
  openCurrentProjectStorage,
  setCurrentProjectId,
} from "./current-project";
import { IndexedDBFSStorage } from "./indexeddb-storage";
import { databaseName, ProjectsDatabase } from "./projects-db";
import { SessionStorageFSStorage } from "./storage";
import { renderHook } from "@testing-library/react";
import {
  resetStorageStatus,
  useProjectsDatabaseActive,
  useStorageVersionError,
} from "./storage-status";

const deleteDatabase = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName());
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error("deleteDatabase failed"));
  });

const encode = (text: string) => new TextEncoder().encode(text);

describe("openCurrentProjectStorage", () => {
  let logging: MockLogging;
  beforeEach(async () => {
    sessionStorage.clear();
    await deleteDatabase();
    logging = new MockLogging();
    resetStorageStatus();
  });

  it("creates a new project and makes it current when there is nothing", async () => {
    const storage = await openCurrentProjectStorage(logging);
    expect(storage).toBeInstanceOf(IndexedDBFSStorage);
    expect(
      renderHook(() => useProjectsDatabaseActive()).result.current
    ).toEqual(true);
    const id = getCurrentProjectId(sessionStorage);
    expect(id).toBeDefined();

    const db = await ProjectsDatabase.open();
    expect((await db.list()).map((p) => p.id)).toEqual([id]);
    expect(await db.files(id!)).toEqual({});
    db.close();
    await (storage as IndexedDBFSStorage).dispose();
  });

  it("reopens the tab's current project and marks it most recent", async () => {
    const db = await ProjectsDatabase.open();
    await db.create({ id: "old", name: "Old", timestamp: 1 }, {});
    await db.create({ id: "cur", name: "Cur", timestamp: 2 }, {});
    await db.touch("old", 3);
    db.close();
    setCurrentProjectId(sessionStorage, "cur");

    const storage = await openCurrentProjectStorage(logging);
    expect(await storage!.projectName()).toEqual("Cur");
    const reopened = await ProjectsDatabase.open();
    expect((await reopened.mostRecent())?.id).toEqual("cur");
    reopened.close();
    await (storage as IndexedDBFSStorage).dispose();
  });

  it("migrates a project from session storage on first load", async () => {
    const legacy = new SessionStorageFSStorage(sessionStorage);
    await legacy.write("main.py", encode("# mine"));
    await legacy.write("helper.py", encode("# helper"));
    await legacy.setProjectName("My project");
    sessionStorage.setItem("unrelated", "kept");

    const storage = await openCurrentProjectStorage(logging);

    expect(await storage!.projectName()).toEqual("My project");
    expect(await storage!.ls()).toEqual(["helper.py", "main.py"]);
    expect(Array.from(await storage!.read("main.py"))).toEqual(
      Array.from(encode("# mine"))
    );
    expect(await legacy.ls()).toEqual([]);
    expect(await legacy.projectName()).toBeUndefined();
    expect(sessionStorage.getItem("unrelated")).toEqual("kept");
    expect(getCurrentProjectId(sessionStorage)).toBeDefined();
    await (storage as IndexedDBFSStorage).dispose();
  });

  it("falls back to session storage when the database cannot be opened", async () => {
    vi.spyOn(ProjectsDatabase, "open").mockRejectedValueOnce(
      new Error("blocked")
    );
    const storage = await openCurrentProjectStorage(logging);
    expect(storage).toBeInstanceOf(SessionStorageFSStorage);
    expect(logging.errors[0].message).toMatch(/using session storage/);
    expect(
      renderHook(() => useProjectsDatabaseActive()).result.current
    ).toEqual(false);
  });

  it("falls back to session storage for an incompatible database on public stages", async () => {
    vi.spyOn(ProjectsDatabase, "open").mockRejectedValueOnce(
      new DOMException("nope", "VersionError")
    );
    const storage = await openCurrentProjectStorage(logging, true);
    expect(storage).toBeInstanceOf(SessionStorageFSStorage);
  });

  it("reports an incompatible database for clearing on non-public stages", async () => {
    vi.spyOn(ProjectsDatabase, "open").mockRejectedValueOnce(
      new DOMException("nope", "VersionError")
    );
    const storage = await openCurrentProjectStorage(logging, false);
    expect(storage).toBeUndefined();
    expect(logging.errors).toEqual([]);
    const { result } = renderHook(() => useStorageVersionError());
    expect((result.current as DOMException).name).toEqual("VersionError");
  });

  it("falls back to session storage without IndexedDB", async () => {
    const original = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", {
      value: undefined,
      configurable: true,
    });
    try {
      const storage = await openCurrentProjectStorage(logging);
      expect(storage).toBeInstanceOf(SessionStorageFSStorage);
    } finally {
      Object.defineProperty(globalThis, "indexedDB", {
        value: original,
        configurable: true,
      });
    }
  });
});
