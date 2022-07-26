/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { MockLogging } from "../logging/mock";
import { NullLogging } from "../deployment/default/logging";
import {
  FSStorage,
  InMemoryFSStorage,
  SessionStorageFSStorage,
  SplitStrategyStorage,
} from "./storage";

const projectName = "projectName";

const commonStorageTests = (storage: FSStorage) => {
  it("is empty", async () => {
    expect(await storage.ls()).toEqual([]);
  });

  it("stores project name", async () => {
    await storage.setProjectName("foo");
    expect(await storage.projectName()).toEqual("foo");
  });

  it("stores dirty flag", async () => {
    expect(await storage.isDirty()).toEqual(false);
    await storage.markDirty();
    expect(await storage.isDirty()).toEqual(true);
    await storage.clearDirty();
    expect(await storage.isDirty()).toEqual(false);
  });

  it("stores files", async () => {
    await storage.write("test1.py", new Uint8Array([1]));
    await storage.write("test2.py", new Uint8Array([2]));

    expect(await storage.ls()).toEqual(["test1.py", "test2.py"]);
    expect(await storage.exists("test1.py")).toEqual(true);
    expect(await storage.exists("testX.py")).toEqual(false);
    expect(await storage.read("test1.py")).toEqual(new Uint8Array([1]));
    expect(await storage.read("test2.py")).toEqual(new Uint8Array([2]));
  });

  it("throws trying to read a non-existent file", async () => {
    await expect(() => storage.read("test1.py")).rejects.toThrowError(
      /No such file test1.py/
    );
  });

  it("removes files", async () => {
    await storage.write("test1.py", new Uint8Array([1]));
    await storage.write("test2.py", new Uint8Array([2]));

    await storage.remove("test1.py");

    expect(await storage.exists("test1.py")).toEqual(false);
    expect(await storage.ls()).toEqual(["test2.py"]);
  });

  it("clears", async () => {
    await storage.write("test1.py", new Uint8Array([1]));
    await storage.write("test2.py", new Uint8Array([2]));

    await storage.clear();

    expect(await storage.exists("test1.py")).toEqual(false);
    expect(await storage.exists("test2.py")).toEqual(false);
    expect(await storage.ls()).toEqual([]);
  });
};

describe("SessionStorageFSStorage", () => {
  const storage = new SessionStorageFSStorage(sessionStorage);
  beforeEach(() => {
    sessionStorage.clear();
  });
  commonStorageTests(storage);
});

describe("InMemoryFSStorage", () => {
  const storage = new InMemoryFSStorage(projectName);
  beforeEach(() => {
    storage.clear();
  });
  commonStorageTests(storage);
});

describe("SplitStrategyStorage", () => {
  const storage = new SplitStrategyStorage(
    new InMemoryFSStorage(projectName),
    new SessionStorageFSStorage(sessionStorage),
    new NullLogging()
  );

  beforeEach(() => {
    storage.clear();
    sessionStorage.clear();
  });
  commonStorageTests(storage);

  it("initializes from session storage", async () => {
    const memory = new InMemoryFSStorage(projectName);
    const session = new SessionStorageFSStorage(sessionStorage);
    await session.setProjectName("foo");
    await session.write("test1.py", new Uint8Array([1]));
    await session.markDirty();

    const split = new SplitStrategyStorage(memory, session, new NullLogging());

    expect(await split.ls()).toEqual(["test1.py"]);
    expect(await split.projectName()).toEqual("foo");
    expect(await split.isDirty()).toEqual(true);
  });

  it("clears and stops using session storage if we hit errors", async () => {
    const memory = new InMemoryFSStorage(projectName);
    const session = new SessionStorageFSStorage(sessionStorage);

    const log = new MockLogging();
    const split = new SplitStrategyStorage(memory, session, log);

    await split.write("test1.py", new Uint8Array([1]));
    // After encoding this is big enough to hit the 5MB limit. Note that Safari is half this.
    await split.write("test2.py", new Uint8Array(3_800_000));

    expect(log.errors[0]).toEqual("Abandoning secondary storage due to error");
    expect(await session.ls()).toEqual([]);
    expect(await memory.ls()).toEqual(["test1.py", "test2.py"]);

    await split.write("test3.py", new Uint8Array([1]));
    expect(await session.ls()).toEqual([]);
    expect(await memory.ls()).toEqual(["test1.py", "test2.py", "test3.py"]);
  });
});
