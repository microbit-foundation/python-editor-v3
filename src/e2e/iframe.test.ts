/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect, FrameLocator, Page } from "@playwright/test";
import { editorUrl } from "./app.js";
import { test } from "./app-test-fixtures.js";

interface EditorMessage {
  type: "pyeditor";
  action: string;
  project?: { files: Record<string, string> };
}

const hostCode = "display.scroll('from the host')";

/**
 * The host page is served by intercepting a request for it and is defined
 * here, in the tests, so it is never part of the app.
 */
const hostPage = (editorSrc: string) => `<!doctype html>
<title>Iframe host harness</title>
<script>
  window.messages = [];
  window.addEventListener("message", (e) => {
    window.messages.push(e.data);
    if (e.data.type === "pyeditor" && e.data.action === "workspacesync") {
      e.source.postMessage(
        { type: "pyeditor", action: "workspacesync", projects: [${JSON.stringify(
          hostCode
        )}] },
        "*"
      );
    }
  });
</script>
<iframe name="editor" src="${editorSrc}" width="1000" height="800"></iframe>
`;

const hostUrl = new URL("e2e-iframe-host.html", editorUrl()).href;

const openEmbeddedEditor = async (page: Page): Promise<FrameLocator> => {
  await page.route(hostUrl, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: hostPage(editorUrl({ controller: true })),
    })
  );
  await page.goto(hostUrl);
  const frame = page.frameLocator("iframe[name='editor']");
  await frame.getByTestId("editor").waitFor();
  return frame;
};

const editorText = (frame: FrameLocator) =>
  frame.getByTestId("editor").getByRole("textbox");

// fill() on the CodeMirror contenteditable sometimes inserts rather than
// replaces, so select everything first.
const replaceEditorText = async (
  page: Page,
  frame: FrameLocator,
  text: string
) => {
  await editorText(frame).click();
  await page.keyboard.press(
    process.platform === "darwin" ? "Meta+a" : "Control+a"
  );
  await page.keyboard.type(text);
};

// Set by the host harness page. Evaluate callbacks run in the page, so the
// cast has to be repeated inside each rather than shared.
const receivedActions = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { messages: EditorMessage[] }).messages.map(
      (m) => m.action
    )
  );

const lastSavedMain = (page: Page) =>
  page.evaluate(() => {
    const { messages } = window as unknown as { messages: EditorMessage[] };
    const saves = messages.filter((m) => m.action === "workspacesave");
    const encoded = saves[saves.length - 1]?.project?.files["main.py"];
    return encoded === undefined ? undefined : atob(encoded);
  });

/**
 * Controller mode, as embedded by classroom: the host owns the project and
 * there is no storage or project management in the editor.
 */
test.describe("iframe controller mode", () => {
  test.use({ autoGoto: false });

  test("loads the host's project and reports back edits", async ({ app }) => {
    const frame = await openEmbeddedEditor(app.page);

    await expect(editorText(frame)).toContainText("from the host");
    expect(await receivedActions(app.page)).toEqual([
      "workspacesync",
      "workspaceloaded",
    ]);

    await replaceEditorText(app.page, frame, "display.scroll('edited')");
    await expect
      .poll(() => lastSavedMain(app.page))
      .toEqual("display.scroll('edited')");
  });

  test("replaces the project when the host imports one", async ({ app }) => {
    const frame = await openEmbeddedEditor(app.page);
    await expect(editorText(frame)).toContainText("from the host");

    await app.page.evaluate(() => {
      const editor = document.querySelector("iframe")!.contentWindow!;
      editor.postMessage(
        {
          type: "pyeditor",
          action: "importproject",
          project: "display.scroll('imported')",
        },
        "*"
      );
    });

    await expect(editorText(frame)).toContainText("imported");
  });

  test("prompts on close if file edited, as the host may not have saved", async ({
    app,
  }) => {
    const frame = await openEmbeddedEditor(app.page);
    await expect(editorText(frame)).toContainText("from the host");

    await replaceEditorText(app.page, frame, "display.scroll('edited')");
    await expect(editorText(frame)).toContainText("edited");

    await app.closeAndExpectBeforeUnloadPrompt();
  });
});
