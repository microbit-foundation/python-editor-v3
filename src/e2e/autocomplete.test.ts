/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("Browser - autocomplete and signature help tests", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterAll(app.dispose.bind(app));

  it("shows autocomplete as you type", async () => {
    await app.clearEditor();
    await app.typeInEditor("from microbit import *\ndisplay.s");

    // Initial completions
    await app.findCompletionOptions(["scroll", "set_pixel", "show"]);
    await app.findCompletionActiveOption("scroll(value)");

    // Further refinement
    await app.typeInEditor("h");
    await app.findCompletionActiveOption("show(image)");

    // Accepted completion
    await app.acceptActiveCompletion();
    await app.findVisibleEditorContents(/display.show\(\)/);
  });
});
