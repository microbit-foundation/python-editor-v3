/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ConsoleLogging } from "../deployment/default/logging";
import { MockLogging } from "../logging/mock";
import {
  InMemoryFSStorage,
  SessionStorageFSStorage,
  SplitStrategyStorage,
} from "./storage";
import { commonStorageTests } from "./storage-tests";

const projectName = "projectName";

describe("SessionStorageFSStorage", () => {
  const storage = new SessionStorageFSStorage(sessionStorage);
  beforeEach(() => {
    sessionStorage.clear();
  });
  commonStorageTests(() => storage);
});

describe("InMemoryFSStorage", () => {
  const storage = new InMemoryFSStorage(projectName);
  beforeEach(() => {
    storage.clear();
  });
  commonStorageTests(() => storage);
});

describe("SplitStrategyStorage", () => {
  const storage = new SplitStrategyStorage(
    new InMemoryFSStorage(projectName),
    new SessionStorageFSStorage(sessionStorage),
    new ConsoleLogging()
  );

  beforeEach(() => {
    storage.clear();
    sessionStorage.clear();
  });
  commonStorageTests(() => storage);

  it("initializes from session storage", async () => {
    const memory = new InMemoryFSStorage(projectName);
    const session = new SessionStorageFSStorage(sessionStorage);
    await session.setProjectName("foo");
    await session.write("test1.py", new Uint8Array([1]));
    await session.markDirty();

    const split = new SplitStrategyStorage(
      memory,
      session,
      new ConsoleLogging()
    );

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

    expect(log.errors[0].message).toEqual(
      "Abandoning secondary storage due to error"
    );
    expect(await session.ls()).toEqual([]);
    expect(await memory.ls()).toEqual(["test1.py", "test2.py"]);

    await split.write("test3.py", new Uint8Array([1]));
    expect(await session.ls()).toEqual([]);
    expect(await memory.ls()).toEqual(["test1.py", "test2.py", "test3.py"]);
  });
});
