/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { sortBy } from "./sort-util";

describe("sortBy", () => {
  it("sorts ascending by a single iteratee", () => {
    expect(sortBy(["banana", "apple", "cherry"], (s) => s)).toEqual([
      "apple",
      "banana",
      "cherry",
    ]);
  });

  it("uses later iteratees as tie-breakers", () => {
    const files = [
      { name: "b.py", main: false },
      { name: "main.py", main: true },
      { name: "a.py", main: false },
    ];
    expect(
      sortBy(
        files,
        (f) => !f.main,
        (f) => f.name
      ).map((f) => f.name)
    ).toEqual(["main.py", "a.py", "b.py"]);
  });

  it("is stable and does not mutate its input", () => {
    const input = [
      { key: 1, id: "first" },
      { key: 0, id: "a" },
      { key: 1, id: "second" },
    ];
    const result = sortBy(input, (x) => x.key);
    expect(result.map((x) => x.id)).toEqual(["a", "first", "second"]);
    expect(input.map((x) => x.id)).toEqual(["first", "a", "second"]);
  });
});
