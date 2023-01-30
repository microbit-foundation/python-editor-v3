/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

const heartMigrationFragment =
  "#project:XQAAgACRAAAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOM4sSAXBT95G3en+tghrYmE+YJp6EiYgzA9ThKkyShWq2UdvmCzqxoNfYc1wlmTqlNv/Piaz3WoSe3flvr/ItyLl0aolQlEpv4LA8A=";

const sunlightSensorMigrationFragment =
  "#project:XQAAgAByAQAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOW6kOsIEMK7SL0Qco7jgsHFKZXfjv/XcHWvXG9qyz1a/a3NUulFDj/FDJxVAIV+WZLpRoo4E6MbW70FOgIfBPWP2hDVsojpoLc7ZfKI8SHxv54FSfB5bkbzaAKO+8CO73t6Odtv691JGjJ9MExFighY6GxyM/DoNInDDpAjFeaqCWrYdwENX7ZVM3we8f4swI71tL28N7sg588aB//A78AA";

describe("migration", () => {
  const app = new App({
    fragment: heartMigrationFragment,
  });
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("Loads the project from the URL", async () => {
    await app.findProjectName("Hearts");
    await app.findVisibleEditorContents(
      "from microbit import *\ndisplay.show(Image.HEART)"
    );

    // Regression test: Check that we can switch to a different migration in the same session.
    // Previously we ignored the migration because we already had content in session storage.
    app.setOptions({
      fragment: sunlightSensorMigrationFragment,
    });
    await app.gotoOptionsUrl();
    await app.findVisibleEditorContents("display.read_light_level");
  });
});
