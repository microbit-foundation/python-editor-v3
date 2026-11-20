/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import "fake-indexeddb/auto";
import { vi } from "vitest";
import { deferred } from "../common/deferred";
import { getCurrentProjectId } from "../fs/current-project";
import { FileSystem } from "../fs/fs";
import { DefaultHost } from "../fs/host";
import { ProjectsDatabase } from "../fs/projects-db";
import { FSStorage, SessionStorageFSStorage } from "../fs/storage";
import { MockLogging } from "../logging/mock";
import { Projects } from "./projects";

// Separate from projects.test.ts, which runs without a window and so
// without the session storage this is about.
describe("Projects with a project left in session storage", () => {
  let counter = 0;
  let db: ProjectsDatabase;
  let logging: MockLogging;
  let legacy: SessionStorageFSStorage;

  beforeEach(async () => {
    sessionStorage.clear();
    db = await ProjectsDatabase.open(`session-${Date.now()}-${counter++}`);
    logging = new MockLogging();
    legacy = new SessionStorageFSStorage(sessionStorage);
    await legacy.write("main.py", new TextEncoder().encode("# mine"));
    await legacy.setProjectName("My project");
  });
  afterEach(() => {
    db.close();
  });

  const start = () => {
    const storage = deferred<FSStorage>();
    const fs = new FileSystem(
      logging,
      new DefaultHost(undefined, storage.promise),
      () => Promise.reject(new Error("MicroPython is not needed here"))
    );
    return new Projects(fs, logging, Promise.resolve(db), storage);
  };

  it("has it in the list, as the tab's project, before a page can ask", async () => {
    const projects = start();

    const list = await projects.refresh();

    expect(list.map((p) => p.name)).toEqual(["My project"]);
    expect(list[0].fileNames).toEqual(["main.py"]);
    expect(getCurrentProjectId(sessionStorage)).toEqual(list[0].id);
    expect(await legacy.ls()).toEqual([]);
  });

  it("still starts if it cannot be moved, and keeps the session copy", async () => {
    vi.spyOn(db, "create").mockRejectedValueOnce(new Error("Simulated"));
    const projects = start();

    expect(await projects.isAvailable()).toEqual(true);
    expect(await projects.refresh()).toEqual([]);
    expect(await legacy.ls()).toEqual(["main.py"]);
    expect(logging.errors.map((e) => e.message)).toEqual([
      "Failed to migrate the session storage project",
    ]);
  });
});
