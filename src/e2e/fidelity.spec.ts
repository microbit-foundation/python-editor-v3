/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * Whole-app screenshot catalogue for the visual fidelity harness. Not part
 * of the default e2e project; bin/fidelity.mjs runs it twice — once against
 * a baseline git ref with --update-snapshots, then against the working tree
 * — and the Playwright HTML report shows the diffs. Baselines are per-run
 * artefacts in .fidelity/, never committed. See RAC-MIGRATION.md.
 */
import { expect, Locator, Page } from "@playwright/test";
import { test } from "./app-test-fixtures.js";

/**
 * Soft so one mismatch doesn't hide diffs later in the same flow.
 */
const screenshot = async (page: Page, name: string, mask: Locator[] = []) => {
  await expect.soft(page).toHaveScreenshot(`${name}.png`, { mask });
};

/**
 * CodeMirror, xterm and the simulator iframe render text/canvas content
 * that isn't reliably pixel-stable (cursor, canvas antialiasing, remote
 * iframe); their styling was verified separately during the migration.
 * Unmatched locators are fine — Playwright ignores masks that don't
 * resolve (e.g. no serial terminal before connecting).
 */
const masks = (page: Page): Locator[] => [
  // Scoped to the main editor: the read-only CodeMirror embeds in the docs
  // sidebar are deterministic renders and worth comparing.
  page.getByTestId("editor").locator(".cm-editor"),
  page.locator("iframe[name='Simulator']"),
  page.locator(".xterm"),
];

/**
 * Wait for every in-DOM image to settle (Sanity content images load from
 * the network and lazy-decode) so both harness runs capture the same
 * pixels.
 */
const imagesSettled = async (page: Page) => {
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("img")).every(
      (img) => img.complete && (img.naturalWidth > 0 || !img.src)
    )
  );
};

/**
 * Make all in-page randomness deterministic so the harness's two runs
 * produce identical states. A monotonic prefix makes later uuids always
 * sort after earlier ones (creation order) regardless of async
 * interleaving; seeding alone is not enough.
 */
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    // mulberry32
    let s = 42;
    const random = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    Math.random = random;
    let calls = 0;
    crypto.getRandomValues = <T extends ArrayBufferView | null>(
      array: T
    ): T => {
      if (array) {
        calls++;
        const bytes = new Uint8Array(
          array.buffer,
          array.byteOffset,
          array.byteLength
        );
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = i < 4 ? (calls >>> (8 * (3 - i))) & 0xff : 0;
        }
      }
      return array;
    };
    crypto.randomUUID = () => {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(
        16,
        20
      )}-${h.slice(20)}`;
    };
  });
});

// The sidebar auto-collapses at or below widthToHideSidebar (1365px), so
// "desktop" must be wider than that; tablet/mobile deliberately capture the
// collapsed-sidebar layout.
const viewports = [
  ["desktop", { width: 1440, height: 745 }],
  ["tablet", { width: 1024, height: 745 }],
  ["mobile", { width: 390, height: 844 }],
] as const;

for (const [label, viewport] of viewports) {
  test.describe(`fidelity ${label}`, () => {
    test.use({ viewport });

    test(`workbench ${label}`, async ({ app, page }) => {
      if (viewport.width > 1365) {
        // The Reference panel has no title heading; wait for its topic
        // list instead.
        await expect(
          page.getByRole("heading", { name: "Display", exact: true })
        ).toBeVisible();
      } else {
        // Sidebar starts collapsed below the threshold; the tab strip is
        // still shown.
        await expect(
          page.getByRole("tab", { name: "Reference" })
        ).toBeVisible();
      }
      await imagesSettled(page);
      await screenshot(page, `workbench-reference--${label}`, masks(page));
      // Selecting a tab expands the sidebar panel when collapsed.
      await app.switchTab("Project");
      await expect(
        page.getByRole("button", { name: "Reset project" })
      ).toBeVisible();
      await screenshot(page, `workbench-project--${label}`, masks(page));
    });
  });
}

test.describe("fidelity desktop states", () => {
  test.use({ viewport: { width: 1440, height: 745 } });

  test("welcome dialog", async ({ app, page }) => {
    // The only state where the welcome dialog isn't suppressed. Mask its
    // embedded video iframe (remote content).
    await page.goto(`${app.baseUrl}/?flag=none`);
    const dialog = page.getByRole("dialog", {
      name: "Welcome to the micro:bit Python Editor",
    });
    await expect(dialog).toBeVisible();
    await screenshot(page, "welcome-dialog", [dialog.locator("iframe")]);
  });

  test("reference topic and detail", async ({ app, page }) => {
    await app.selectDocumentationSection("Display");
    await expect(
      page.getByRole("heading", { name: "Display", exact: true })
    ).toBeVisible();
    await imagesSettled(page);
    await screenshot(page, "reference-topic-display", masks(page));

    await app.toggleCodeActionButton("scroll");
    await imagesSettled(page);
    await screenshot(page, "reference-topic-display-detail", masks(page));
  });

  test("api tab", async ({ app, page }) => {
    await app.switchTab("API");
    await expect(
      page.getByRole("heading", { name: "API", exact: true })
    ).toBeVisible();
    await imagesSettled(page);
    await screenshot(page, "api-tab", masks(page));
  });

  test("ideas tab and idea", async ({ app, page }) => {
    await app.switchTab("Ideas");
    await app.expectDocumentationTopLevelHeading(
      "Ideas",
      "Try out these projects, modify them and get inspired"
    );
    await imagesSettled(page);
    await screenshot(page, "ideas-tab", masks(page));

    await app.selectDocumentationIdea("Emotion badge");
    await app.expectDocumentationTopLevelHeading("Emotion badge");
    await imagesSettled(page);
    await screenshot(page, "idea-emotion-badge", masks(page));
  });

  test("search dialog", async ({ app, page }) => {
    await app.search("loop");
    const results = page.getByRole("dialog").getByRole("link");
    await results.first().waitFor();
    await screenshot(page, "search-results", masks(page));
  });

  test("project dialogs and menus", async ({ app, page }) => {
    await app.switchTab("Project");

    const menu = await app.projectTab.openFileActionsMenu("main.py");
    await expect(menu.editButton).toBeVisible();
    await screenshot(page, "file-actions-menu", masks(page));
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Create file" }).click();
    await expect(page.getByLabel("Name*")).toBeVisible();
    await screenshot(page, "create-file-dialog", masks(page));
    await page.keyboard.press("Escape");

    // Two edit-name pencils are visible on the Project tab (action bar +
    // tab panel); either opens the same dialog.
    await page
      .getByRole("button", { name: "Edit project name" })
      .first()
      .click();
    await expect(page.getByLabel("Name*")).toBeVisible();
    await screenshot(page, "project-name-dialog", masks(page));
    await page.keyboard.press("Escape");

    // Reset only confirms when the project is dirty; on a clean project it
    // fires the success toast instead (captured separately).
    await app.typeInEditor("# fidelity");
    await page.getByRole("button", { name: "Reset project" }).click();
    await expect(page.getByRole("button", { name: "Replace" })).toBeVisible();
    await screenshot(page, "reset-project-dialog", masks(page));
    await page.keyboard.press("Escape");
  });

  // Destructuring `app` is what triggers navigation (the fixture's goto),
  // even in tests that only drive `page` afterwards.
  test("send and save menus", async ({ app, page }) => {
    await app.saveButton.waitFor();
    await page.getByTestId("more-connect-options").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await screenshot(page, "send-menu", masks(page));
    await page.keyboard.press("Escape");

    await page.getByTestId("more-save-options").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await screenshot(page, "save-menu", masks(page));
    await page.keyboard.press("Escape");
  });

  test("settings menu and dialogs", async ({ app, page }) => {
    await app.saveButton.waitFor();
    await page.getByTestId("settings").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await screenshot(page, "settings-menu", masks(page));

    await page.getByRole("menuitem", { name: "Settings" }).click();
    await expect(
      page.getByText("Allow editing third-party modules", { exact: true })
    ).toBeVisible();
    await screenshot(page, "settings-dialog", masks(page));
    await page.getByRole("button", { name: "Close" }).click();

    await page.getByTestId("settings").click();
    await page.getByTestId("language").click();
    await expect(page.getByTestId("fr")).toBeVisible();
    await screenshot(page, "language-dialog", masks(page));
    await page.keyboard.press("Escape");
  });

  test("help menu and about dialog", async ({ app, page }) => {
    await app.saveButton.waitFor();
    await page.getByRole("button", { name: "Help" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await screenshot(page, "help-menu", masks(page));

    await page.getByRole("menuitem", { name: "About" }).click();
    await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
    await imagesSettled(page);
    await screenshot(page, "about-dialog", masks(page));

    await page.getByRole("button", { name: "Read more" }).click();
    await imagesSettled(page);
    await screenshot(page, "about-dialog-expanded", masks(page));
  });

  test("connect flow and serial", async ({ app, page }) => {
    await app.sendToMicrobitButton.click();
    const nextButton = page.getByRole("button", { name: "Next" });
    await expect(nextButton).toBeVisible();
    await screenshot(page, "connect-cable-dialog", masks(page));

    await nextButton.click();
    await expect(page.getByText("In next popup:")).toBeVisible();
    await screenshot(page, "connect-webusb-dialog", masks(page));

    // Mock device: connecting succeeds and the program is flashed.
    await nextButton.click();
    await app.expectConnected();
    await screenshot(page, "connected-serial-compact", masks(page));

    await app.simulator.showSerialButton.click();
    await app.simulator.hideSerialButton.waitFor();
    await screenshot(page, "connected-serial-expanded", masks(page));

    await app.simulator.serialMenu.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await screenshot(page, "serial-menu", masks(page));
    await page.keyboard.press("Escape");

    // Expanded serial shows the hints dialog via its own info button (the
    // menu item only exists in compact mode).
    await page
      .getByRole("button", { name: "Serial hints and tips" })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: "Serial hints and tips" })
    ).toBeVisible();
    await screenshot(page, "serial-help-dialog", masks(page));
  });

  test("collapsed chrome states", async ({ app, page }) => {
    await app.sidebar.collapseButton.click();
    await app.sidebar.expandButton.waitFor();
    await screenshot(page, "sidebar-collapsed", masks(page));
    await app.sidebar.expandButton.click();
    await app.sidebar.collapseButton.waitFor();

    await app.simulator.collapseButton.click();
    await app.simulator.expandButton.waitFor();
    await screenshot(page, "simulator-hidden", masks(page));
  });

  test("success toast", async ({ app, page }) => {
    // Resetting a clean project skips the confirm dialog and fires the
    // success toast through the shared toast region.
    await app.switchTab("Project");
    await page.getByRole("button", { name: "Reset project" }).click();
    await expect(
      page.getByText("Project reset to the default starter code")
    ).toBeVisible();
    await screenshot(page, "success-toast", masks(page));
  });

  test("load file dialog", async ({ app, page }) => {
    await app.loadFiles("testData/module.py");
    await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
    await screenshot(page, "load-file-dialog", masks(page));
  });

  test("save flow dialogs", async ({ app, page }) => {
    // Saving a project still on the default name prompts for one first.
    await app.saveButton.click();
    await expect(page.getByText("Name your project")).toBeVisible();
    await screenshot(page, "name-project-dialog", masks(page));

    await page.getByLabel("Name*").fill("fidelity");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Confirm" }).click();
    await downloadPromise;
    await app.expectDialog("Project saved");
    await screenshot(page, "post-save-dialog", masks(page));
  });
});
