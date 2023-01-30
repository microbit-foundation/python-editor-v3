/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("reset", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("resets the project", async () => {
    await app.setProjectName("My project");
    await app.selectAllInEditor();
    await app.typeInEditor("# Not the default starter code");
    await app.createNewFile("testing");

    await app.resetProject();

    // Everything's back to normal.
    await app.findProjectName("Untitled project");
    await app.findVisibleEditorContents("from microbit import");
    await app.findProjectFiles(["main.py"]);
  });
});
