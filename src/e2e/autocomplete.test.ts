/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";
import { expect } from "@playwright/test";

const showSignature = "show(image, delay=400, wait=";

test.describe("autocomplete", () => {
  test("shows autocomplete as you type", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.s");

    // Initial completions
    await app.expectCompletionOptions(["scroll", "set_pixel", "show"]);
    await app.expectCompletionActiveOption("scroll(text)");

    // Further refinement
    await app.page.keyboard.press("h");
    await app.expectCompletionActiveOption("show(image)");

    // Accepted completion
    await app.acceptCompletion("show");
    await app.expectEditorContainText("display.show()");
  });

  test("ranks Image above image=", async ({ app }) => {
    // This particular case has been tweaked in a somewhat fragile way.
    // See the boost code in autocompletion.ts

    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.show(image");

    await app.expectCompletionOptions(["Image", "image="]);
  });

  test("autocomplete can navigate to API toolkit content", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");

    await app.expectCompletionActiveOption("show(image)");

    await app.followCompletionOrSignatureDocumentionLink("API");

    await app.expectActiveApiEntry(showSignature);
  });

  test("autocomplete can navigate to Reference toolkit content", async ({
    app,
  }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");
    await app.expectCompletionActiveOption("show(image)");
    await app.followCompletionOrSignatureDocumentionLink("Help");
    await app.expectActiveApiEntry("Show");
  });

  test("shows signature help after autocomplete", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");
    await app.acceptCompletion("show");

    await app.expectSignatureHelp(showSignature);
  });

  test("does not insert brackets for import completion", async ({ app }) => {
    // This relies on undocumented Pyright behaviour so important to cover at a high level.
    await app.selectAllInEditor();
    await app.typeInEditor("from audio import is_pla");
    await app.acceptCompletion("is_playing");

    await app.expectEditorContainText(/is_playing$/);
  });

  test("signature can navigate to API toolkit content", async ({ app }) => {
    await app.selectAllInEditor();
    // The closing bracket is autoinserted.
    await app.typeInEditor("from microbit import *\ndisplay.show(");

    const signatureHelp = app.page
      .getByTestId("editor")
      .locator("div")
      .filter({ hasText: showSignature })
      .nth(1);
    await signatureHelp.waitFor();
    await expect(signatureHelp).toBeVisible();
    await app.followCompletionOrSignatureDocumentionLink("API");

    await app.expectActiveApiEntry(showSignature);
  });

  test("signature can navigate to Reference toolkit content", async ({
    app,
  }) => {
    await app.selectAllInEditor();
    // The closing bracket is autoinserted.
    await app.typeInEditor("from microbit import *\ndisplay.show(");
    await app.expectSignatureHelp(showSignature);
    await app.followCompletionOrSignatureDocumentionLink("Help");
    await app.expectActiveApiEntry("Show");
  });
});
