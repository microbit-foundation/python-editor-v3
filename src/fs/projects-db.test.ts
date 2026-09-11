/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import "fake-indexeddb/auto";
import { openDB } from "idb";
import { databaseName, ProjectMeta, ProjectsDatabase } from "./projects-db";

let counter = 0;
const uniqueName = () => `test-${Date.now()}-${counter++}`;

const meta = (id: string, timestamp: number, name = id): ProjectMeta => ({
  id,
  name,
  timestamp,
  dirty: false,
});
const bytes = (...values: number[]) => new Uint8Array(values);
// Typed arrays read back through fake-indexeddb under jsdom belong to another
// realm, so compare contents rather than objects.
const contents = (files: Record<string, Uint8Array>) =>
  Object.fromEntries(
    Object.entries(files).map(([name, data]) => [name, Array.from(data)])
  );

describe("databaseName", () => {
  it("is namespaced by the base path so production and beta stay apart", () => {
    expect(databaseName("local", "/")).toEqual("python-editor");
    expect(databaseName("PRODUCTION", "/v/3/")).toEqual("python-editor/v/3");
    expect(databaseName("STAGING", "/v/beta/")).toEqual("python-editor/v/beta");
  });

  it("is shared by every review build", () => {
    expect(databaseName("REVIEW", "/some-branch/")).toEqual(
      "python-editor-review"
    );
    expect(databaseName("REVIEW", "/another/")).toEqual("python-editor-review");
  });
});

describe("ProjectsDatabase", () => {
  let db: ProjectsDatabase;
  beforeEach(async () => {
    db = await ProjectsDatabase.open(uniqueName());
  });
  afterEach(() => db.close());

  it("starts empty", async () => {
    expect(await db.list()).toEqual([]);
    expect(await db.mostRecent()).toBeUndefined();
  });

  it("creates projects with files and lists them most recent first", async () => {
    await db.create(meta("a", 1), { "main.py": bytes(1) });
    await db.create(meta("b", 2), { "main.py": bytes(2), "x.py": bytes(3) });
    expect((await db.list()).map((p) => p.id)).toEqual(["b", "a"]);
    expect(await db.mostRecent()).toEqual(meta("b", 2));
    expect(contents(await db.files("b"))).toEqual({
      "main.py": [2],
      "x.py": [3],
    });
    expect(await db.fileNames("a")).toEqual(["main.py"]);
    expect(Array.from((await db.file("a", "main.py"))!)).toEqual([1]);
    expect(await db.file("a", "nope.py")).toBeUndefined();
  });

  it("applies metadata, writes and deletes together", async () => {
    await db.create(meta("a", 1), { "main.py": bytes(1), "old.py": bytes(9) });
    await db.apply("a", {
      meta: { name: "renamed", dirty: true, timestamp: 5 },
      writes: { "main.py": bytes(2), "new.py": bytes(3) },
      deletes: ["old.py"],
    });
    expect(await db.get("a")).toEqual({
      id: "a",
      name: "renamed",
      dirty: true,
      timestamp: 5,
    });
    expect(contents(await db.files("a"))).toEqual({
      "main.py": [2],
      "new.py": [3],
    });
  });

  it("refuses changes to a project that does not exist", async () => {
    await expect(db.apply("missing", { meta: { name: "x" } })).rejects.toThrow(
      /No such project missing/
    );
  });

  it("touch makes a project the most recent", async () => {
    await db.create(meta("a", 1), {});
    await db.create(meta("b", 2), {});
    await db.touch("a", 3);
    expect((await db.mostRecent())?.id).toEqual("a");
  });

  it("duplicates a project's files under new metadata", async () => {
    await db.create(meta("a", 1), { "main.py": bytes(1) });
    await db.duplicate("a", meta("b", 2, "copy"));
    expect(await db.get("b")).toEqual(meta("b", 2, "copy"));
    expect(contents(await db.files("b"))).toEqual({ "main.py": [1] });
  });

  it("deletes a project and its files", async () => {
    await db.create(meta("a", 1), { "main.py": bytes(1), "x.py": bytes(2) });
    await db.create(meta("b", 2), { "main.py": bytes(3) });
    await db.delete("a");
    expect((await db.list()).map((p) => p.id)).toEqual(["b"]);
    expect(contents(await db.files("a"))).toEqual({});
    expect(contents(await db.files("b"))).toEqual({ "main.py": [3] });
  });

  it("rejects a database created by an incompatible version", async () => {
    const name = uniqueName();
    // Same version number, different stores: what a future schema change
    // that forgot to bump the version would look like from an old build.
    const other = await openDB(name, 1, {
      upgrade(db) {
        db.createObjectStore("something-else");
      },
    });
    other.close();
    await expect(ProjectsDatabase.open(name)).rejects.toMatchObject({
      name: "VersionError",
    });
  });
});
