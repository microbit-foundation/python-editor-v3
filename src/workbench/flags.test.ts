/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { flagsForParams } from "../flags";

describe("flags", () => {
  it("enables opt-in flags for REVIEW stage", () => {
    const params = new URLSearchParams([]);

    const flags = flagsForParams("REVIEW", params);
    expect(flags.noWelcome).toEqual(true);
    expect(flags.dndDebug).toEqual(false);
  });

  it("only enables PWA in production", () => {
    const params = new URLSearchParams([]);

    const flags = flagsForParams("PRODUCTION", params);

    expect(flags.pwa).toBe(true);
    const { pwa, ...filteredFlags } = flags;

    expect(Object.values(filteredFlags).every((x) => !x)).toEqual(true);
  });

  it("enable specific flag", () => {
    const params = new URLSearchParams([["flag", "noWelcome"]]);

    const flags = flagsForParams("PRODUCTION", params);

    expect(
      Object.entries(flags).every(
        ([flag, status]) => (flag === "noWelcome" || flag === "pwa") === status
      )
    ).toEqual(true);
  });

  it("enable everything", () => {
    const params = new URLSearchParams([["flag", "*"]]);
    const flags = flagsForParams("PRODUCTION", params);
    expect(Object.values(flags).every((x) => x)).toEqual(true);
  });

  it("enable nothing", () => {
    const params = new URLSearchParams([["flag", "none"]]);
    const flags = flagsForParams("REVIEW", params);
    expect(Object.values(flags).every((x) => !x)).toEqual(true);
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
