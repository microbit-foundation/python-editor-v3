/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

const showFullSignature =
  "show(image, delay=400, wait=True, loop=False, clear=False)";

describe("Browser - autocomplete and signature help tests", () => {
  // Enable flags to allow testing the toolkit interactions.
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("shows autocomplete as you type", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.s");

    // Initial completions
    await app.findCompletionOptions(["scroll", "set_pixel", "show"]);
    await app.findCompletionActiveOption("scroll(text)");

    // Further refinement
    await app.typeInEditor("h");
    await app.findCompletionActiveOption("show(image)");

    // Accepted completion
    await app.acceptCompletion("show");
    await app.findVisibleEditorContents("display.show()");
  });

  it("ranks Image above image=", async () => {
    // This particular case has been tweaked in a somewhat fragile way.
    // See the boost code in autocompletion.ts

    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.show(image");

    await app.findCompletionOptions(["Image", "image="]);
  });

  it("autocomplete can navigate to toolkit content", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");

    await app.findCompletionActiveOption("show(image)");

    await app.followCompletionOrSignatureDocumentionLink();

    await app.findActiveDocumentationEntry(showFullSignature);
  });

  it("shows signature help after autocomplete", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");
    await app.acceptCompletion("show");

    await app.findSignatureHelp(showFullSignature);
  });

  it("does not insert brackets for import completion", async () => {
    // This relies on undocumented Pyright behaviour so important to cover at a high level.
    await app.selectAllInEditor();
    await app.typeInEditor("from audio import is_pla");
    await app.acceptCompletion("is_playing");

    await app.findVisibleEditorContents(/is_playing$/);
  });

  it("signature can navigate to toolkit content", async () => {
    await app.selectAllInEditor();
    // The closing bracket is autoinserted.
    await app.typeInEditor("from microbit import *\ndisplay.show(");

    await app.findSignatureHelp(showFullSignature);

    await app.followCompletionOrSignatureDocumentionLink();

    await app.findActiveDocumentationEntry("clear()");
  });
});
