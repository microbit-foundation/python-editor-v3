/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { flagsForParams } from "../flags";

describe("flags", () => {
  it("enables everything in REVIEW", () => {
    const params = new URLSearchParams([]);

    const flags = flagsForParams("REVIEW", params);

    expect(Object.values(flags).every((x) => x)).toEqual(true);
  });

  for (const stage of ["STAGING", "PRODUCTION"]) {
    it("enables nothing in " + stage, () => {
      const params = new URLSearchParams([]);

      const flags = flagsForParams(stage, params);

      expect(Object.values(flags).every((x) => x)).toEqual(false);
    });
  }

  it("enable specific flag", () => {
    const params = new URLSearchParams([["flag", "noWelcome"]]);

    const flags = flagsForParams("PRODUCTION", params);

    expect(
      Object.entries(flags).every(
        ([flag, status]) => (flag === "noWelcome") === status
      )
    ).toEqual(true);
  });

  it("can combine none with specific enabled flags in REVIEW", () => {
    const params = new URLSearchParams([
      ["flag", "none"],
      ["flag", "noWelcome"],
    ]);

    const flags = flagsForParams("REVIEW", params);

    expect(flags.dndDebug).toBe(false);
    expect(flags.noWelcome).toBe(true);
  });
});
