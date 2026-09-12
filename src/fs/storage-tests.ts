/**
 * Behaviour every FSStorage implementation must have. Not a test file itself;
 * each implementation's test calls it.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FSStorage } from "./storage";

export const commonStorageTests = (storage: () => FSStorage) => {
  it("is empty", async () => {
    expect(await storage().ls()).toEqual([]);
  });

  it("stores project name", async () => {
    await storage().setProjectName("foo");
    expect(await storage().projectName()).toEqual("foo");
  });

  it("stores files", async () => {
    await storage().write("test1.py", new Uint8Array([1]));
    await storage().write("test2.py", new Uint8Array([2]));

    expect(await storage().ls()).toEqual(["test1.py", "test2.py"]);
    expect(await storage().exists("test1.py")).toEqual(true);
    expect(await storage().exists("testX.py")).toEqual(false);
    expect(Array.from(await storage().read("test1.py"))).toEqual([1]);
    expect(Array.from(await storage().read("test2.py"))).toEqual([2]);
  });

  it("throws trying to read a non-existent file", async () => {
    await expect(() => storage().read("test1.py")).rejects.toThrow(
      /No such file test1.py/
    );
  });

  it("removes files", async () => {
    await storage().write("test1.py", new Uint8Array([1]));
    await storage().write("test2.py", new Uint8Array([2]));

    await storage().remove("test1.py");

    expect(await storage().exists("test1.py")).toEqual(false);
    expect(await storage().ls()).toEqual(["test2.py"]);
  });

  it("clears", async () => {
    await storage().write("test1.py", new Uint8Array([1]));
    await storage().write("test2.py", new Uint8Array([2]));

    await storage().clear();

    expect(await storage().exists("test1.py")).toEqual(false);
    expect(await storage().exists("test2.py")).toEqual(false);
    expect(await storage().ls()).toEqual([]);
  });
};

/**
 * For storage that lives no longer than the tab and so tracks the dirty flag.
 */
export const dirtyFlagTests = (storage: () => FSStorage) => {
  it("stores dirty flag", async () => {
    expect(await storage().isDirty()).toEqual(false);
    await storage().markDirty();
    expect(await storage().isDirty()).toEqual(true);
    await storage().clearDirty();
    expect(await storage().isDirty()).toEqual(false);
  });
};
