/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { vi } from "vitest";
import en from "../messages/ui.en.json";
import SettingsArea from "./SettingsArea";
import SettingsProvider from "./settings";

const renderSettingsArea = (messages: Record<string, unknown>) =>
  render(
    <IntlProvider locale="de" messages={{ ...en, ...messages }}>
      <SettingsProvider>
        <SettingsArea />
      </SettingsProvider>
    </IntlProvider>
  );

describe("SettingsArea", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the translated parameter help shortcut", () => {
    vi.stubGlobal("navigator", { ...navigator, platform: "Win32" });
    renderSettingsArea({
      "parameter-help-manual": "Anleitung ({shortcut})",
      "parameter-help-shortcut": "Strg+Umschalt+Leertaste",
    });
    expect(
      screen.getByRole("option", {
        name: "Anleitung (Strg+Umschalt+Leertaste)",
      })
    ).toBeDefined();
  });

  it("uses the translated Mac parameter help shortcut on a Mac", () => {
    vi.stubGlobal("navigator", { ...navigator, platform: "MacIntel" });
    renderSettingsArea({
      "parameter-help-manual": "Anleitung ({shortcut})",
      "parameter-help-shortcut-mac": "Befehl+Umschalt+Leertaste",
    });
    expect(
      screen.getByRole("option", {
        name: "Anleitung (Befehl+Umschalt+Leertaste)",
      })
    ).toBeDefined();
  });
});
