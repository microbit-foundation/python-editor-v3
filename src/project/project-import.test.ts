/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { MAIN_FILE } from "../fs/fs";
import { filesForNewProject } from "./project-import";

const text = (s: string) => new TextEncoder().encode(s);
const decode = (b: Uint8Array) => new TextDecoder().decode(b);

describe("filesForNewProject", () => {
  it("makes a single script main.py and names the project after it", () => {
    const { name, files } = filesForNewProject([
      { name: "dice.py", data: text("print('dice')") },
    ]);
    expect(name).toEqual("dice");
    expect(Object.keys(files)).toEqual([MAIN_FILE]);
    expect(decode(files[MAIN_FILE])).toEqual("print('dice')");
  });

  it("keeps a module under its own name and adds the starter main.py", () => {
    const { name, files } = filesForNewProject([
      { name: "module.py", data: text("# microbit-module: a@1.0.0\n") },
    ]);
    expect(name).toBeUndefined();
    expect(Object.keys(files).sort()).toEqual([MAIN_FILE, "module.py"]);
    expect(decode(files[MAIN_FILE])).toMatch(/from microbit import/);
  });

  it("keeps main.py when given one, with the other files alongside", () => {
    const { name, files } = filesForNewProject([
      { name: "helper.py", data: text("x = 1") },
      { name: MAIN_FILE, data: text("import helper") },
    ]);
    expect(name).toBeUndefined();
    expect(Object.keys(files).sort()).toEqual(["helper.py", MAIN_FILE]);
    expect(decode(files[MAIN_FILE])).toEqual("import helper");
  });

  it("does not guess between several scripts", () => {
    const { name, files } = filesForNewProject([
      { name: "a.py", data: text("a") },
      { name: "b.py", data: text("b") },
    ]);
    expect(name).toBeUndefined();
    expect(Object.keys(files).sort()).toEqual(["a.py", "b.py", MAIN_FILE]);
  });

  it("adds the starter main.py to a lone data file", () => {
    const { files } = filesForNewProject([
      { name: "data.txt", data: text("1,2,3") },
    ]);
    expect(Object.keys(files).sort()).toEqual(["data.txt", MAIN_FILE]);
  });
});
