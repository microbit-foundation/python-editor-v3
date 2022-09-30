/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { defaultSettings, isValidSettingsObject } from "./settings";

describe("isValidSettingsObject", () => {
  it("checks parameter help", () => {
    expect(
      isValidSettingsObject({
        ...defaultSettings,
        parameterHelp: "woah",
      })
    ).toEqual(false);

    expect(
      isValidSettingsObject({
        ...defaultSettings,
        parameterHelp: "automatic",
      })
    ).toEqual(true);

    expect(
      isValidSettingsObject({
        ...defaultSettings,
        parameterHelp: "manual",
      })
    ).toEqual(true);
  });
  it("checks language is supported", () => {
    expect(
      isValidSettingsObject({
        ...defaultSettings,
        languageId: "xx",
      })
    ).toEqual(false);
  });
});
