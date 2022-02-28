/**
 * @jest-environment node
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import * as fs from "fs";
import * as fsp from "fs/promises";
import { NullLogging } from "../deployment/default/logging";
import {
  diff,
  EVENT_PROJECT_UPDATED,
  FileSystem,
  MAIN_FILE,
  Project,
  VersionAction,
  VersionedData,
} from "./fs";
import { MicroPythonSource } from "./micropython";
import { BoardId } from "../device/board-id";
import { defaultInitialProject, InitialProject } from "./initial-project";

const hexes = Promise.all([
  fs.readFileSync("src/fs/microbit-micropython-v1.hex", {
    encoding: "ascii",
  }),
  fs.readFileSync("src/fs/microbit-micropython-v2.hex", {
    encoding: "ascii",
  }),
]);

const fsMicroPythonSource: MicroPythonSource = async () => {
  const [v1, v2] = await hexes;
  return [
    {
      boardId: 0x9900,
      hex: v1,
    },
    {
      boardId: 0x9003,
      hex: v2,
    },
  ];
};

describe("Filesystem", () => {
  const logging = new NullLogging();
  const initialProject: InitialProject = defaultInitialProject;
  const initialProjectSource = async () => initialProject;
  let ufs = new FileSystem(logging, initialProjectSource, fsMicroPythonSource);
  let events: Project[] = [];

  beforeEach(() => {
    events = [];
    ufs = new FileSystem(logging, initialProjectSource, fsMicroPythonSource);
    ufs.addListener(EVENT_PROJECT_UPDATED, events.push.bind(events));
  });

  it("has an initial blank project", async () => {
    expect(ufs.project.files).toEqual([]);
    expect(ufs.project.id).toBeDefined();
    expect(ufs.dirty).toEqual(false);

    await ufs.initialize();

    expect(ufs.dirty).toEqual(false);
    expect(ufs.project.files).toEqual([{ name: MAIN_FILE, version: 1 }]);
  });

  it("initialize", async () => {
    await ufs.initialize();

    expect(events.length).toEqual(2);
    expect(events[0].files).toEqual([{ name: MAIN_FILE, version: 1 }]);
    expect(events[1].files).toEqual([{ name: MAIN_FILE, version: 1 }]);

    expect(ufs.project.files).toEqual([{ name: MAIN_FILE, version: 1 }]);
  });

  it("can check for file existence", async () => {
    await ufs.initialize();

    expect(await ufs.exists(MAIN_FILE)).toEqual(true);
    expect(await ufs.exists("some other file")).toEqual(false);
  });

  it("can manage the project name", async () => {
    expect(ufs.dirty).toEqual(false);
    expect(ufs.project.name).toEqual(defaultInitialProject.name);
    await ufs.setProjectName("test 1");
    expect(ufs.dirty).toEqual(true);
    expect(ufs.project.name).toEqual("test 1");

    await ufs.initialize();

    expect(ufs.project.name).toEqual("test 1");
    await ufs.setProjectName("test 2");
    expect(ufs.project.name).toEqual("test 2");
  });

  it("can read/write files", async () => {
    await ufs.write(MAIN_FILE, "content1", VersionAction.INCREMENT);

    expect(await asString(ufs.read(MAIN_FILE))).toEqual("content1");
    expect(ufs.project.files).toEqual([{ name: MAIN_FILE, version: 1 }]);

    await ufs.write(MAIN_FILE, "content2", VersionAction.MAINTAIN);

    expect(await asString(ufs.read(MAIN_FILE))).toEqual("content2");
    expect(ufs.project.files).toEqual([{ name: MAIN_FILE, version: 1 }]);

    await ufs.write(MAIN_FILE, "content3", VersionAction.INCREMENT);

    expect(await asString(ufs.read(MAIN_FILE))).toEqual("content3");
    expect(ufs.project.files).toEqual([{ name: MAIN_FILE, version: 2 }]);
  });

  it("writes that don't increment the version mark the project as dirty", async () => {
    await ufs.write(MAIN_FILE, "content1", VersionAction.INCREMENT);
    expect(ufs.dirty).toEqual(false);
    await ufs.write(MAIN_FILE, "content1", VersionAction.MAINTAIN);
    expect(ufs.dirty).toEqual(true);
  });

  it("throws error attempting to read non-existent file", async () => {
    await expect(() => ufs.read("non-existent file")).rejects.toThrowError(
      /No such file non-existent file/
    );
  });

  it("can remove files", async () => {
    await ufs.write(MAIN_FILE, "hey", VersionAction.INCREMENT);
    expect(events[0].files).toEqual([{ name: MAIN_FILE, version: 1 }]);

    await ufs.remove(MAIN_FILE);

    expect(events[1].files).toEqual([]);
    expect(await ufs.exists(MAIN_FILE)).toEqual(false);
  });

  it("can replace project with a hex", async () => {
    await ufs.initialize();

    await ufs.exists(MAIN_FILE);
    await ufs.write("other.txt", "content", VersionAction.INCREMENT);
    const originalId = ufs.project.id;

    await ufs.replaceWithHexContents(
      "new project name",
      await fsp.readFile("testData/1.0.1.hex", { encoding: "ascii" })
    );

    expect(await asString(ufs.read(MAIN_FILE))).toMatch(/PASS1/);
    // "other.txt" has gone
    expect(ufs.project.files).toEqual([{ name: MAIN_FILE, version: 2 }]);
    expect(ufs.project.name).toEqual("new project name");
    expect(ufs.project.id === originalId).toEqual(false);
  });

  it("can order files ascendingly according to their file names", async () => {
    await ufs.initialize();

    await ufs.write("afile.py", "content", VersionAction.INCREMENT);
    await ufs.write("zfile.py", "content", VersionAction.INCREMENT);
    await ufs.write("bfile.py", "content", VersionAction.INCREMENT);

    expect(ufs.project.files.map((f) => f.name)).toEqual([
      MAIN_FILE,
      "afile.py",
      "bfile.py",
      "zfile.py",
    ]);
  });

  it("no longer dirty if new hex loaded", async () => {
    await ufs.setProjectName("new name");
    expect(ufs.dirty).toEqual(true);

    await ufs.replaceWithHexContents(
      "different name",
      await fsp.readFile("testData/1.0.1.hex", { encoding: "ascii" })
    );

    expect(ufs.dirty).toEqual(false);
  });

  it("copes if you add new large files", async () => {
    await ufs.initialize();
    const data = new Uint8Array(100_000);
    data.fill(128);
    await ufs.write("big.dat", data, VersionAction.INCREMENT);

    // But not if you ask for the hex.
    await expect(() => ufs.toHexForDownload()).rejects.toThrow(
      /There is no storage space left./
    );
  });

  it("copes if you grow existing files beyond the limit", async () => {
    await ufs.initialize();
    const data = new Uint8Array(100_000);
    data.fill(128);
    await ufs.write(MAIN_FILE, data, VersionAction.MAINTAIN);

    // But not if you ask for the hex.
    await expect(() => ufs.toHexForDownload()).rejects.toThrow(
      /There is no storage space left./
    );
  });

  it("creates a universal hex for download", async () => {
    await ufs.setProjectName("test project name");
    const data = await ufs.toHexForDownload();

    expect(typeof data).toEqual("string");
  });

  it("creates board-specific data for flashing", async () => {
    const boardId = BoardId.parse("9900");
    const partial = await ufs.partialFlashData(boardId);
    const full = await ufs.fullFlashData(boardId);
    expect(partial.length).toBeLessThan(full.length);
  });

  it("gives useful stats", async () => {
    expect(await ufs.statistics()).toEqual({
      files: 1,
      lines: undefined, // signifies initial program
      storageUsed: 256,
    });

    await ufs.write(
      MAIN_FILE,
      "from __future__ import hope\n" + initialProject.main,
      VersionAction.MAINTAIN
    );
    const data = new Uint8Array(512);
    data.fill(128);
    await ufs.write("other.dat", data, VersionAction.INCREMENT);
    expect(await ufs.statistics()).toEqual({
      files: 2,
      lines: 10,
      storageUsed: 896,
    });
  });
});

describe("fs - diff", () => {
  const empty: Project = {
    name: "foo",
    id: "asdf",
    files: [],
  };
  const main1: Project = {
    name: "foo",
    id: "asdf",
    files: [{ name: "main.py", version: 1 }],
  };
  const main2: Project = {
    name: "foo",
    id: "asdf",
    files: [{ name: "main.py", version: 2 }],
  };
  const other: Project = {
    name: "foo",
    id: "asdf",
    files: [
      { name: "main.py", version: 1 },
      { name: "other.py", version: 1 },
    ],
  };
  it("no changes when no changes", () => {
    expect(diff(other, other)).toEqual([]);
  });
  it("detects create", () => {
    // We're empty on start-up
    expect(diff(empty, main1)).toEqual([{ name: "main.py", type: "create" }]);
    expect(diff(main1, other)).toEqual([{ name: "other.py", type: "create" }]);
  });
  it("detects delete", () => {
    expect(diff(other, main1)).toEqual([{ name: "other.py", type: "delete" }]);
  });
  it("detects edit", () => {
    expect(diff(main1, main2)).toEqual([{ name: "main.py", type: "edit" }]);
    expect(diff(main2, main1)).toEqual([{ name: "main.py", type: "edit" }]);
  });
});

const asString = async (f: Promise<VersionedData>) =>
  new TextDecoder().decode((await f).data);
