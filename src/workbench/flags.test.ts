/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FlagMetadata, flagsForParams } from "../flags";

/**
 * Test-only flag metadata so these tests cover the resolution rules
 * rather than the current defaults for real flags.
 */
type TestFlag = "onInReview" | "onInProduction" | "alwaysOff";
const testFlags: FlagMetadata<TestFlag>[] = [
  { name: "onInReview", defaultOnStages: ["local", "REVIEW"] },
  { name: "onInProduction", defaultOnStages: ["PRODUCTION"] },
  { name: "alwaysOff", defaultOnStages: [] },
];

const resolve = (
  stage: Parameters<typeof flagsForParams>[0],
  params: [string, string][]
) => flagsForParams(stage, new URLSearchParams(params), testFlags);

describe("flags", () => {
  it("uses stage defaults when nothing is specified", () => {
    expect(resolve("REVIEW", [])).toEqual({
      onInReview: true,
      onInProduction: false,
      alwaysOff: false,
    });
    expect(resolve("PRODUCTION", [])).toEqual({
      onInReview: false,
      onInProduction: true,
      alwaysOff: false,
    });
  });

  it("enables a specific flag on top of the stage defaults", () => {
    expect(resolve("PRODUCTION", [["flag", "alwaysOff"]])).toEqual({
      onInReview: false,
      onInProduction: true,
      alwaysOff: true,
    });
  });

  it("enables everything with *", () => {
    expect(resolve("PRODUCTION", [["flag", "*"]])).toEqual({
      onInReview: true,
      onInProduction: true,
      alwaysOff: true,
    });
  });

  it("disables everything with none", () => {
    expect(resolve("REVIEW", [["flag", "none"]])).toEqual({
      onInReview: false,
      onInProduction: false,
      alwaysOff: false,
    });
  });

  it("combines none with specific enabled flags", () => {
    expect(
      resolve("REVIEW", [
        ["flag", "none"],
        ["flag", "alwaysOff"],
      ])
    ).toEqual({
      onInReview: false,
      onInProduction: false,
      alwaysOff: true,
    });
  });

  it("ignores unknown flags", () => {
    expect(resolve("PRODUCTION", [["flag", "doesNotExist"]])).toEqual({
      onInReview: false,
      onInProduction: true,
      alwaysOff: false,
    });
  });

  describe("local storage", () => {
    afterEach(() => localStorage.removeItem("flags"));

    it("enables comma-separated flags from local storage", () => {
      localStorage.setItem("flags", "alwaysOff, onInReview");
      expect(resolve("PRODUCTION", [])).toEqual({
        onInReview: true,
        onInProduction: true,
        alwaysOff: true,
      });
    });
  });
});
