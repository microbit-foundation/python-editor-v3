/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

const heartMigrationFragment =
  "#project:XQAAgACRAAAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOM4sSAXBT95G3en+tghrYmE+YJp6EiYgzA9ThKkyShWq2UdvmCzqxoNfYc1wlmTqlNv/Piaz3WoSe3flvr/ItyLl0aolQlEpv4LA8A=";

const sunlightSensorMigrationFragment =
  "#project:XQAAgAByAQAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOW6kOsIEMK7SL0Qco7jgsHFKZXfjv/XcHWvXG9qyz1a/a3NUulFDj/FDJxVAIV+WZLpRoo4E6MbW70FOgIfBPWP2hDVsojpoLc7ZfKI8SHxv54FSfB5bkbzaAKO+8CO73t6Odtv691JGjJ9MExFighY6GxyM/DoNInDDpAjFeaqCWrYdwENX7ZVM3we8f4swI71tL28N7sg588aB//A78AA";

test.describe("migration", () => {
  test("Loads the project from the URL", async ({ app }) => {
    await app.goto({ fragment: heartMigrationFragment });
    await app.page.reload();
    await app.expectProjectName("Hearts");
    await app.expectEditorContainText(
      "from microbit import *display.show(Image.HEART)"
    );

    // Regression test: Check that we can switch to a different migration in the same session.
    // Previously we ignored the migration because we already had content in session storage.
    await app.goto({
      fragment: sunlightSensorMigrationFragment,
    });
    await app.page.reload();
    // wait for page to load
    await app.saveButton.waitFor();
    await app.expectEditorContainText("display.read_light_level");
  });
});
