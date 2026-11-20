/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import "fake-indexeddb/auto";
import { vi } from "vitest";
import { IndexedDBFSStorage } from "./indexeddb-storage";
import { ProjectsDatabase } from "./projects-db";
import { commonStorageTests } from "./storage-tests";

let counter = 0;
const uniqueName = () => `test-${Date.now()}-${counter++}`;
const projectId = "p1";
const contents = (files: Record<string, Uint8Array>) =>
  Object.fromEntries(
    Object.entries(files).map(([name, data]) => [name, Array.from(data)])
  );

const openWithProject = async () => {
  const db = await ProjectsDatabase.open(uniqueName());
  await db.create({ id: projectId, name: undefined, timestamp: 1 }, {});
  return db;
};

describe("IndexedDBFSStorage", () => {
  let db: ProjectsDatabase;
  let storage: IndexedDBFSStorage;
  let errors: unknown[];
  let changes: number;
  beforeEach(async () => {
    db = await openWithProject();
    errors = [];
    changes = 0;
    storage = new IndexedDBFSStorage(
      db,
      { id: projectId, name: undefined, timestamp: 1 },
      (e) => errors.push(e),
      () => changes++,
      20
    );
  });
  afterEach(async () => {
    await storage.dispose();
    db.close();
  });

  commonStorageTests(() => storage);

  it("coalesces writes into one transaction after the delay", async () => {
    const save = vi.spyOn(db, "save");
    await storage.write("main.py", new Uint8Array([1]));
    await storage.write("main.py", new Uint8Array([2]));
    await storage.write("other.py", new Uint8Array([3]));
    await storage.setProjectName("Renamed");
    expect(save).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(save).toHaveBeenCalledTimes(1);
    expect(contents(await db.files(projectId))).toEqual({
      "main.py": [2],
      "other.py": [3],
    });
    expect((await db.get(projectId))?.name).toEqual("Renamed");
  });

  it("does not track the dirty flag", async () => {
    const save = vi.spyOn(db, "save");
    await storage.markDirty();
    await storage.flush();
    expect(await storage.isDirty()).toEqual(false);
    expect(save).not.toHaveBeenCalled();
  });

  it("reports each successful flush for cross-tab sync", async () => {
    await storage.write("main.py", new Uint8Array([1]));
    await storage.flush();
    await storage.flush();
    expect(changes).toEqual(1);
  });

  it("a remove after a write in the same batch wins", async () => {
    await storage.write("main.py", new Uint8Array([1]));
    await storage.remove("main.py");
    await storage.flush();
    expect(contents(await db.files(projectId))).toEqual({});
  });

  it("bumps the project timestamp when it flushes changes", async () => {
    await storage.write("main.py", new Uint8Array([1]));
    await storage.flush();
    expect((await db.get(projectId))?.timestamp).toBeGreaterThan(1);
  });

  it("issues its writes at once when the page is hidden", async () => {
    const save = vi.spyOn(db, "save");
    await storage.write("main.py", new Uint8Array([1]));
    await storage.remove("old.py");
    await storage.setProjectName("Renamed");
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    // Before the event handler returns: an unloading page gets no later
    // chance.
    expect(save).toHaveBeenCalledWith(
      { id: projectId, name: "Renamed", timestamp: expect.any(Number) },
      { writes: { "main.py": new Uint8Array([1]) }, deletes: ["old.py"] },
      { urgent: true }
    );

    await storage.flush();
    expect(contents(await db.files(projectId))).toEqual({ "main.py": [1] });
    expect((await db.get(projectId))?.name).toEqual("Renamed");
    expect(changes).toEqual(1);
  });

  it("flushes on pagehide whatever the visibility", async () => {
    const save = vi.spyOn(db, "save");
    await storage.write("main.py", new Uint8Array([1]));
    window.dispatchEvent(new Event("pagehide"));
    expect(save).toHaveBeenCalledTimes(1);

    await storage.flush();
    expect(contents(await db.files(projectId))).toEqual({ "main.py": [1] });
  });

  it("keeps the later of two flushes that overlap", async () => {
    await storage.write("main.py", new Uint8Array([1]));
    const first = storage.flush();
    await storage.write("main.py", new Uint8Array([2]));
    await storage.flush({ urgent: true });
    await first;
    expect(contents(await db.files(projectId))).toEqual({ "main.py": [2] });
    expect(errors).toEqual([]);
  });

  it("reports a failure to announce a change and carries on", async () => {
    const failing = new IndexedDBFSStorage(
      db,
      { id: projectId, name: undefined, timestamp: 1 },
      (e) => errors.push(e),
      () => {
        throw new Error("channel closed");
      },
      20
    );
    await failing.write("main.py", new Uint8Array([1]));
    await failing.flush();
    expect(errors).toHaveLength(1);

    await failing.write("main.py", new Uint8Array([2]));
    expect(Array.from(await failing.read("main.py"))).toEqual([2]);
    await failing.dispose();
  });

  it("adopts a name saved elsewhere unless it has an unsaved rename", async () => {
    await storage.write("main.py", new Uint8Array([1]));
    storage.adoptName("Renamed elsewhere");
    await storage.flush();
    expect((await db.get(projectId))?.name).toEqual("Renamed elsewhere");

    await storage.setProjectName("Renamed here");
    storage.adoptName("Renamed elsewhere again");
    await storage.flush();
    expect((await db.get(projectId))?.name).toEqual("Renamed here");
  });

  it("does not write back a project deleted elsewhere", async () => {
    await db.delete(projectId);
    await storage.write("main.py", new Uint8Array([1]));
    await storage.flush();
    expect(errors).toHaveLength(1);
    expect(await db.get(projectId)).toBeUndefined();
    expect(contents(await db.files(projectId))).toEqual({});
  });

  it("writes nothing once abandoned", async () => {
    const save = vi.spyOn(db, "save");
    await storage.write("main.py", new Uint8Array([1]));
    storage.abandon();
    await storage.write("other.py", new Uint8Array([2]));
    window.dispatchEvent(new Event("pagehide"));
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(save).not.toHaveBeenCalled();
    expect(errors).toEqual([]);
  });

  it("reports a failed flush and drops those changes rather than throwing", async () => {
    vi.spyOn(db, "save").mockRejectedValueOnce(
      new DOMException("full", "QuotaExceededError")
    );
    await storage.write("main.py", new Uint8Array([1]));
    await storage.flush();
    expect(errors).toHaveLength(1);
    expect((errors[0] as DOMException).name).toEqual("QuotaExceededError");

    await storage.write("other.py", new Uint8Array([2]));
    await storage.flush();
    expect(contents(await db.files(projectId))).toEqual({ "other.py": [2] });
  });
});
