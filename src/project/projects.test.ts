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
import { Projects, ProjectSaveErrorEvent } from "./projects";

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

/** A tab: its own file system and projects session over a database. */
const openTab = (db: ProjectsDatabase | undefined) => {
  const storage = deferred<FSStorage>();
  const host = new DefaultHost(undefined, storage.promise);
  const fs = new FileSystem(logging, host, microPythonSource);
  const projects = new Projects(fs, logging, Promise.resolve(db), storage);
  return { db, fs, projects };
};

const setup = async (dbAvailable = true) =>
  openTab(
    dbAvailable
      ? await ProjectsDatabase.open(`projects-${Date.now()}-${counter++}`)
      : undefined
  );

const decode = (data: Uint8Array) => new TextDecoder().decode(data);

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

  it("reports whether main.py is still the starter program", async () => {
    const { fs, projects } = await setup();
    await projects.openCurrent();
    await fs.initialize();
    expect((await fs.statistics()).defaultMain).toEqual(true);

    await fs.write(MAIN_FILE, "# edited", VersionAction.MAINTAIN);
    expect((await fs.statistics()).defaultMain).toEqual(false);
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
    // Left for the pages to refresh, so the new card can't show early.
    expect(projects.projects.map((p) => p.id)).not.toContain(second);
    expect((await projects.refresh()).map((p) => p.id)).toEqual([
      second,
      first,
    ]);

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

  it("a failed save raises saveerror each time but is logged once", async () => {
    const { db, fs, projects } = await setup();
    await projects.openCurrent();
    await fs.initialize();
    const error = new DOMException("Simulated", "QuotaExceededError");
    vi.spyOn(db!, "save").mockRejectedValue(error);
    const logged = vi
      .spyOn(logging, "error")
      .mockImplementation(() => undefined);
    const errors: unknown[] = [];
    projects.addEventListener("saveerror", (e: ProjectSaveErrorEvent) => {
      errors.push(e.error);
    });

    await fs.write(MAIN_FILE, "# one", VersionAction.MAINTAIN);
    await vi.waitFor(() => expect(errors).toHaveLength(1));
    await fs.write(MAIN_FILE, "# two", VersionAction.MAINTAIN);
    await vi.waitFor(() => expect(errors).toHaveLength(2));

    expect(errors).toEqual([error, error]);
    expect(logged).toHaveBeenCalledTimes(1);
    // The in-memory copy still has the edit.
    expect((await fs.read(MAIN_FILE)).data).toEqual(
      new TextEncoder().encode("# two")
    );
  });

  describe("with the same project open in another tab", () => {
    const twoTabs = async () => {
      const a = await setup();
      const b = openTab(a.db);
      // No session storage here, so the second tab opens the most recent
      // project: the first tab's.
      for (const tab of [a, b]) {
        await tab.projects.openCurrent();
        await tab.fs.initialize();
      }
      expect(b.projects.currentId).toEqual(a.projects.currentId);
      return { a, b, db: a.db!, id: a.projects.currentId! };
    };

    it("shows the other tab's edits", async () => {
      const { a, b } = await twoTabs();
      await a.fs.write(
        MAIN_FILE,
        "# from the other tab",
        VersionAction.MAINTAIN
      );
      await vi.waitFor(async () =>
        expect(decode((await b.fs.read(MAIN_FILE)).data)).toEqual(
          "# from the other tab"
        )
      );
    });

    it("reloads without changing the project id or unchanged files' versions", async () => {
      const { a, b } = await twoTabs();
      await b.fs.write("helper.py", "# helper", VersionAction.INCREMENT);
      await vi.waitFor(() =>
        expect(a.fs.project.files.map((f) => f.name)).toContain("helper.py")
      );
      const id = b.fs.project.id;
      const version = (name: string) =>
        b.fs.project.files.find((f) => f.name === name)!.version;
      const helperBefore = version("helper.py");
      const mainBefore = version(MAIN_FILE);

      await a.fs.write(MAIN_FILE, "# from a", VersionAction.MAINTAIN);
      await vi.waitFor(() =>
        expect(version(MAIN_FILE)).toBeGreaterThan(mainBefore)
      );

      expect(b.fs.project.id).toEqual(id);
      expect(version("helper.py")).toEqual(helperBefore);
    });

    it("keeps the other tab's rename when this one has edits still to save", async () => {
      const { a, b, db, id } = await twoTabs();
      await b.fs.write(MAIN_FILE, "# unsaved in b", VersionAction.MAINTAIN);
      await a.projects.rename(id, "Renamed in A");

      // Long enough for the reloads and flushes this sets off to finish.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect((await db.get(id))?.name).toEqual("Renamed in A");
      expect(a.fs.project.name).toEqual("Renamed in A");
      expect(b.fs.project.name).toEqual("Renamed in A");
      expect(decode((await db.file(id, MAIN_FILE))!)).toEqual("# unsaved in b");
    });

    it("lets go of a project the other tab deletes and does not write it back", async () => {
      const { a, b, db, id } = await twoTabs();
      const errors: unknown[] = [];
      b.projects.addEventListener("saveerror", (e: ProjectSaveErrorEvent) => {
        errors.push(e.error);
      });
      const deleted = new Promise((resolve) =>
        b.projects.addEventListener("openprojectdeleted", resolve)
      );

      await a.projects.delete([id]);
      await deleted;
      expect(b.projects.currentId).toBeUndefined();

      // The editor may still be showing it.
      await b.fs.write(MAIN_FILE, "# typed after", VersionAction.MAINTAIN);
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(errors).toEqual([]);
      expect(await db.get(id)).toBeUndefined();
      expect(await db.files(id)).toEqual({});
    });

    /**
     * Runs an action in the middle of the second tab's handling of a change
     * to the open project: just after it has read the project's record.
     */
    const duringReload = async (
      action: (tabs: Awaited<ReturnType<typeof twoTabs>>) => Promise<void>
    ) => {
      const tabs = await twoTabs();
      const load = tabs.db.load.bind(tabs.db);
      let acted: Promise<void> | undefined;
      vi.spyOn(tabs.db, "load").mockImplementationOnce(async (id) => {
        const content = await load(id);
        acted = action(tabs);
        await acted;
        return content;
      });
      await tabs.a.fs.write(MAIN_FILE, "# changed", VersionAction.MAINTAIN);
      await vi.waitFor(() => expect(acted).toBeDefined());
      await acted;
      return tabs;
    };

    it("still lets go of it if it is deleted while reloading", async () => {
      let deleted: Promise<unknown> | undefined;
      const errors: unknown[] = [];
      const { b, db, id } = await duringReload(async ({ a, b, id }) => {
        b.projects.addEventListener("saveerror", (e: ProjectSaveErrorEvent) => {
          errors.push(e.error);
        });
        deleted = new Promise((resolve) =>
          b.projects.addEventListener("openprojectdeleted", resolve)
        );
        await a.projects.delete([id]);
      });

      await deleted;
      expect(b.projects.currentId).toBeUndefined();
      await b.fs.write(MAIN_FILE, "# typed after", VersionAction.MAINTAIN);
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(errors).toEqual([]);
      expect(await db.get(id)).toBeUndefined();
    });

    it("does not go back to it if the user has opened another meanwhile", async () => {
      let other: string | undefined;
      const { b } = await duringReload(async ({ b }) => {
        other = await b.projects.create("Other");
      });
      // Long enough for a mistaken switch back to have happened.
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(b.projects.currentId).toEqual(other);
      expect(b.fs.project.name).toEqual("Other");
    });
  });

  describe("when a project fails to load", () => {
    const error = new Error("Simulated read failure");
    const helper = new TextEncoder().encode("# helper");

    const withSavedProject = async () => {
      const result = await setup();
      await result.db!.create(
        { id: "saved", name: "Saved", timestamp: 1 },
        {
          [MAIN_FILE]: new TextEncoder().encode("# saved"),
          "helper.py": helper,
        }
      );
      return result;
    };

    const expectSavedIntact = async (db: ProjectsDatabase) => {
      expect((await db.get("saved"))?.name).toEqual("Saved");
      expect(Object.keys(await db.files("saved")).sort()).toEqual([
        "helper.py",
        MAIN_FILE,
      ]);
    };

    it("open rejects, writes nothing and keeps the open project", async () => {
      const { db, fs, projects } = await withSavedProject();
      const first = await projects.create("First");
      await fs.initialize();
      vi.spyOn(db!, "load").mockRejectedValueOnce(error);

      await expect(projects.open("saved")).rejects.toBe(error);

      await expectSavedIntact(db!);
      expect((await db!.get("saved"))?.timestamp).toEqual(1);
      expect(projects.currentId).toEqual(first);
      expect(fs.project.name).toEqual("First");
    });

    it("openCurrent rejects, keeps the error for the page and can retry", async () => {
      const { db, fs, projects } = await withSavedProject();
      vi.spyOn(db!, "load").mockRejectedValueOnce(error);

      await expect(projects.openCurrent()).rejects.toBe(error);
      expect(projects.takeOpenFailure()).toBe(error);
      expect(projects.takeOpenFailure()).toBeUndefined();
      await expectSavedIntact(db!);

      await projects.openCurrent();
      await fs.initialize();
      expect(projects.currentId).toEqual("saved");
      expect(fileNames(fs)).toEqual([MAIN_FILE, "helper.py"]);
    });

    it("a reload for another tab's change keeps this tab's copy", async () => {
      const { db, fs, projects } = await withSavedProject();
      await projects.openCurrent();
      await fs.initialize();
      vi.spyOn(db!, "load").mockRejectedValueOnce(error);
      const logged = vi
        .spyOn(logging, "error")
        .mockImplementation(() => undefined);

      const otherTab = new BroadcastChannel("python-editor-projects");
      otherTab.postMessage({ type: "changed", projectIds: ["saved"] });
      otherTab.close();

      await vi.waitFor(() =>
        expect(logged).toHaveBeenCalledWith("Failed to reload project", error)
      );
      expect(projects.currentId).toEqual("saved");
      expect(fileNames(fs)).toEqual([MAIN_FILE, "helper.py"]);
      await expectSavedIntact(db!);
    });
  });

  it("switches project even if MicroPython failed to load", async () => {
    const storage = deferred<FSStorage>();
    let failLoad!: (e: Error) => void;
    const loading = new Promise<never>((_, reject) => {
      failLoad = reject;
    });
    let source: MicroPythonSource = () => loading;
    const fs = new FileSystem(
      logging,
      new DefaultHost(undefined, storage.promise),
      () => source()
    );
    const db = await ProjectsDatabase.open(`projects-${counter++}`);
    const projects = new Projects(fs, logging, Promise.resolve(db), storage);
    await projects.openCurrent();
    const first = projects.currentId!;
    await fs.initializeInBackground();
    // The load fails while the switch waits for it.
    const switchStorage = fs.switchStorage.bind(fs);
    vi.spyOn(fs, "switchStorage").mockImplementationOnce((s) => {
      const switching = switchStorage(s);
      failLoad(new Error("Simulated MicroPython load failure"));
      source = microPythonSource;
      return switching;
    });

    const second = await projects.create("Second");
    await fs.write(MAIN_FILE, "# typed in second", VersionAction.MAINTAIN);
    await projects.rename(second, "Second");

    expect(projects.currentId).toEqual(second);
    expect(decode((await db.file(second, MAIN_FILE))!)).toEqual(
      "# typed in second"
    );
    expect(decode((await db.file(first, MAIN_FILE))!)).not.toEqual(
      "# typed in second"
    );
  });

  it("an error from the first project's storage leaves the database copy", async () => {
    const { db, fs, projects } = await setup();
    await db!.create(
      { id: "saved", name: "Saved", timestamp: 1 },
      { [MAIN_FILE]: new TextEncoder().encode("# saved") }
    );
    await projects.openCurrent();
    await fs.initialize();

    await expect(fs.remove("missing.py")).rejects.toThrow(/No such file/);
    // A clear would run in the background after the rejection, with nothing
    // to await, so outlast the storage's flush delay before checking.
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect((await db!.get("saved"))?.name).toEqual("Saved");
    expect(Object.keys(await db!.files("saved"))).toEqual([MAIN_FILE]);
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
