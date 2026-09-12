/**
 * @vitest-environment node
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import "fake-indexeddb/auto";
import * as nodeFs from "fs";
import { vi } from "vitest";
import { deferred } from "../common/deferred";
import { ConsoleLogging } from "../deployment/default/logging";
import { FileSystem, MAIN_FILE, VersionAction } from "../fs/fs";
import { DefaultHost } from "../fs/host";
import { ProjectsDatabase } from "../fs/projects-db";
import { FSStorage } from "../fs/storage";
import { MicroPythonSource } from "../micropython/micropython";
import { Projects } from "./projects";

const hexes = [
  nodeFs.readFileSync("src/micropython/microbit-micropython-v1.hex", {
    encoding: "ascii",
  }),
  nodeFs.readFileSync("src/micropython/main/microbit-micropython-v2.hex", {
    encoding: "ascii",
  }),
];
const microPythonSource: MicroPythonSource = async () => [
  { boardId: 0x9900, hex: hexes[0] },
  { boardId: 0x9903, hex: hexes[1] },
];

let counter = 0;
const logging = new ConsoleLogging();

// Recency ordering is by timestamp; make each one distinct so the tests do
// not depend on how much happens within a millisecond.
beforeEach(() => {
  let now = 1_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => now++);
});

const setup = async (dbAvailable = true) => {
  const db = dbAvailable
    ? await ProjectsDatabase.open(`projects-${Date.now()}-${counter++}`)
    : undefined;
  const storage = deferred<FSStorage | undefined>();
  const host = new DefaultHost("", storage.promise);
  const fs = new FileSystem(logging, host, microPythonSource);
  const projects = new Projects(fs, logging, Promise.resolve(db), storage);
  return { db, fs, projects };
};

const fileNames = (fs: FileSystem) => fs.project.files.map((f) => f.name);

describe("Projects", () => {
  it("openCurrent creates a project and gives the file system its storage", async () => {
    const { db, fs, projects } = await setup();
    await projects.openCurrent();
    await fs.initialize();

    expect(projects.currentId).toBeDefined();
    expect(fileNames(fs)).toEqual([MAIN_FILE]);
    expect((await projects.refresh()).map((p) => p.id)).toEqual([
      projects.currentId,
    ]);
    // Written through to the database, not just the in-memory copy.
    await fs.write(MAIN_FILE, "# edited", VersionAction.MAINTAIN);
    await projects.rename(projects.currentId!, "Named");
    expect(
      new TextDecoder().decode(await db!.file(projects.currentId!, MAIN_FILE))
    ).toEqual("# edited");
  });

  it("concurrent openCurrent calls choose one project", async () => {
    const { projects } = await setup();
    await Promise.all([projects.openCurrent(), projects.openCurrent()]);
    expect((await projects.refresh()).map((p) => p.id)).toEqual([
      projects.currentId,
    ]);
  });

  it("openCurrent keeps the open project", async () => {
    const { projects } = await setup();
    await projects.openCurrent();
    const first = projects.currentId;
    await projects.openCurrent();
    expect(projects.currentId).toEqual(first);
  });

  it("create switches the editor to the new project, and open switches back", async () => {
    const { fs, projects } = await setup();
    await projects.openCurrent();
    await fs.initialize();
    const first = projects.currentId!;
    await fs.write("helper.py", "# helper", VersionAction.INCREMENT);

    const second = await projects.create("Second");

    expect(projects.currentId).toEqual(second);
    expect(fs.project.name).toEqual("Second");
    expect(fileNames(fs)).toEqual([MAIN_FILE]);
    expect(projects.projects.map((p) => p.id)).toEqual([second, first]);

    await projects.open(first);
    expect(fs.project.name).toBeUndefined();
    expect(fileNames(fs)).toEqual([MAIN_FILE, "helper.py"]);
  });

  it("renames the open project through the file system and others directly", async () => {
    const { db, fs, projects } = await setup();
    await projects.openCurrent();
    await fs.initialize();
    const open = projects.currentId!;
    await db!.create({ id: "other", name: "Other", timestamp: 1 }, {});

    await projects.rename(open, "Renamed open");
    await projects.rename("other", "Renamed other");

    expect(fs.project.name).toEqual("Renamed open");
    expect((await db!.get(open))?.name).toEqual("Renamed open");
    expect((await db!.get("other"))?.name).toEqual("Renamed other");
    expect(projects.projects.map((p) => p.name).sort()).toEqual([
      "Renamed open",
      "Renamed other",
    ]);
  });

  it("duplicates the open project including unsaved edits", async () => {
    const { db, fs, projects } = await setup();
    await projects.openCurrent();
    await fs.initialize();
    await fs.write(MAIN_FILE, "# latest", VersionAction.MAINTAIN);

    const copy = await projects.duplicate(projects.currentId!, "Copy");

    expect((await db!.get(copy))?.name).toEqual("Copy");
    expect(new TextDecoder().decode(await db!.file(copy, MAIN_FILE))).toEqual(
      "# latest"
    );
    expect(projects.currentId).not.toEqual(copy);
  });

  it("deleting the open project makes openCurrent choose another", async () => {
    const { db, fs, projects } = await setup();
    await projects.openCurrent();
    await fs.initialize();
    const deleted = projects.currentId!;
    await db!.create({ id: "other", name: "Other", timestamp: 1 }, {});

    await projects.delete([deleted]);
    expect(projects.currentId).toBeUndefined();
    expect(projects.projects.map((p) => p.id)).toEqual(["other"]);

    await projects.openCurrent();
    expect(projects.currentId).toEqual("other");
    expect(fs.project.name).toEqual("Other");
  });

  it("without the database there is nothing to manage and the editor still works", async () => {
    const { fs, projects } = await setup(false);
    expect(await projects.isAvailable()).toEqual(false);
    await projects.openCurrent();
    await fs.initialize();
    expect(fileNames(fs)).toEqual([MAIN_FILE]);
    expect(await projects.refresh()).toEqual([]);
    await expect(projects.create("x")).rejects.toThrow(/not available/);
  });
});
