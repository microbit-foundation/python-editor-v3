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
  beforeEach(async () => {
    db = await openWithProject();
    errors = [];
    storage = new IndexedDBFSStorage(db, projectId, (e) => errors.push(e), 20);
  });
  afterEach(async () => {
    await storage.dispose();
  });

  commonStorageTests(() => storage);

  it("coalesces writes into one transaction after the delay", async () => {
    const apply = vi.spyOn(db, "apply");
    await storage.write("main.py", new Uint8Array([1]));
    await storage.write("main.py", new Uint8Array([2]));
    await storage.write("other.py", new Uint8Array([3]));
    await storage.setProjectName("Renamed");
    expect(apply).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(apply).toHaveBeenCalledTimes(1);
    expect(contents(await db.files(projectId))).toEqual({
      "main.py": [2],
      "other.py": [3],
    });
    expect((await db.get(projectId))?.name).toEqual("Renamed");
  });

  it("does not track the dirty flag", async () => {
    const apply = vi.spyOn(db, "apply");
    await storage.markDirty();
    await storage.flush();
    expect(await storage.isDirty()).toEqual(false);
    expect(apply).not.toHaveBeenCalled();
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

  it("flushes when the page is hidden", async () => {
    await storage.write("main.py", new Uint8Array([1]));
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    // The flush is asynchronous; wait less than the scheduled delay.
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(contents(await db.files(projectId))).toEqual({ "main.py": [1] });
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
  });

  it("reports a failed flush and drops those changes rather than throwing", async () => {
    vi.spyOn(db, "apply").mockRejectedValueOnce(
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
