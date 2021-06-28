/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { waitFor, waitForOptions } from "@testing-library/dom";
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as os from "os";
import * as path from "path";
import "pptr-testing-library/extend";
import puppeteer, { ElementHandle, Page, Dialog, Browser } from "puppeteer";

export enum LoadDialogType {
  CONFIRM,
  REPLACE,
  NONE,
}

export interface BrowserDownload {
  filename: string;
  data: Buffer;
}

/**
 * Model of the app to drive it for e2e testing.
 *
 * We could split this into screen areas accessible from this class.
 *
 * All methods should ensure they wait for a condition rather than relying on timing.
 *
 * Generally this means it's better to pass in expected values, so you can wait for
 * them to be true, than to read and return data from the DOM.
 */
export class App {
  /**
   * Tracks dialogs observed by Pupeteer's dialog event.
   */
  private dialogs: string[] = [];
  private browser: Promise<Browser>;
  private page: Promise<Page>;
  private downloadPath = fs.mkdtempSync(
    path.join(os.tmpdir(), "puppeteer-downloads-")
  );

  constructor() {
    this.browser = puppeteer.launch();
    this.page = this.createPage();
  }

  async createPage() {
    const browser = await this.browser;

    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: this.downloadPath,
    });

    this.dialogs.length = 0;
    page.on("dialog", async (dialog: Dialog) => {
      this.dialogs.push(dialog.type());
      // Need to accept() so that reload() will complete.
      await dialog.accept();
    });

    await page.evaluate(() => {
      if (document.domain === "localhost") {
        window.localStorage.clear();
      }
    });

    return page;
  }

  /**
   * Close the page, accepting any native dialogs (e.g. beforeunload).
   *
   * @returns a boolean representing whether a "beforeunload" dialog is raised.
   */
  async closePageCheckDialog(): Promise<boolean> {
    const page = await this.page;
    await page.close({
      runBeforeUnload: true,
    });
    // A delay is required to give us a chance to handle the dialog event.
    // If this proves fragile we could wait for the success condition below
    // and give up on testing the absence of a dialog.
    await page.waitForTimeout(50);
    return this.dialogs.length === 1 && this.dialogs[0] === "beforeunload";
  }

  /**
   * Reload the page, accepting any native dialogs (e.g. beforeunload).
   */
  async reloadPage(): Promise<void> {
    const page = await this.page;
    await page.reload();
  }

  /**
   * Open a file using the file chooser.
   *
   * @param filePath The file on disk.
   * @param options Options to control expectations after upload.
   */
  async loadFiles(
    filePath: string,
    options: { acceptDialog: LoadDialogType }
  ): Promise<void> {
    await this.selectSideBar("Files");
    const document = await this.document();
    const openInput = await document.getAllByTestId("open-input");
    await openInput[0].uploadFile(filePath);
    await this.findAndAcceptLoadDialog(options.acceptDialog);
  }

  /**
   * Create a new file using the files tab.
   *
   * @param name The name to enter in the dialog.
   */
  async createNewFile(name: string): Promise<void> {
    await this.selectSideBar("Files");
    const document = await this.document();
    const newButton = await document.findByRole("button", {
      name: "Create new file",
    });
    await newButton.click();
    const nameField = await document.findByRole("textbox", {
      name: "Name",
    });
    await nameField.type(name);
    const createButton = await document.findByRole("button", {
      name: "Create",
    });
    await createButton.click();
  }

  /**
   * Open a file using drag and drop.
   *
   * This is a bit fragile and likely to break if we change the DnD DOM as
   * we resort to simulating DnD events.
   *
   * @param filePath The file on disk.
   */
  async dropFile(
    filePath: string,
    options: { acceptDialog: LoadDialogType }
  ): Promise<void> {
    const page = await this.page;
    // Puppeteer doesn't have file drio support but we can use an input
    // to grab a file and trigger an event that's good enough.
    // It's a bit of a pain as the drop happens on an element created by
    // the drag-over.
    // https://github.com/puppeteer/puppeteer/issues/1376
    const inputId = "simulated-drop-input";
    await page.evaluate((inputId) => {
      const input = document.createElement("input");
      input.style.display = "none";
      input.type = "file";
      input.id = inputId;
      input.onchange = (e: any) => {
        const dragOverZone = document.querySelector(
          "[data-testid=project-drop-target]"
        );
        if (!dragOverZone) {
          throw new Error();
        }
        const dragOverEvent = new Event("dragover", {
          bubbles: true,
        });
        const dropEvent = new Event("drop", {
          bubbles: true,
        });
        (dragOverEvent as any).dataTransfer = { types: ["Files"] };
        (dropEvent as any).dataTransfer = { files: e.target.files };
        dragOverZone.dispatchEvent(dragOverEvent);

        const dropZone = document.querySelector(
          "[data-testid=project-drop-target-overlay]"
        );
        dropZone!.dispatchEvent(dropEvent);

        input.remove();
      };
      document.body.appendChild(input);
    }, inputId);
    const fileInput = await page.$(`#${inputId}`);
    await fileInput!.uploadFile(filePath);
    await this.findAndAcceptLoadDialog(options.acceptDialog);
  }

  private async findAndAcceptLoadDialog(dialogType: LoadDialogType) {
    if (dialogType === LoadDialogType.CONFIRM) {
      return this.findAndClickButton("Confirm");
    }
    if (dialogType === LoadDialogType.REPLACE) {
      return this.findAndClickButton("Replace");
    }
  }

  private async findAndClickButton(name: string): Promise<void> {
    const document = await this.document();
    const button = await document.findByRole("button", {
      name: name,
    });
    await button.click();
  }

  async openSettingsDialog(): Promise<void> {
    return this.findAndClickButton("Settings");
  }

  async closeSettingsDialog(): Promise<void> {
    return this.findAndClickButton("Close");
  }

  /**
   * Use the Files sidebar to change the current file we're editing.
   *
   * @param filename The name of the file in the file list.
   */
  async switchToEditing(filename: string): Promise<void> {
    await this.openFileActionsMenu(filename);
    const document = await this.document();
    const editButton = await document.findByRole("menuitem", {
      name: "Edit " + filename,
    });
    await editButton.click();
  }

  /**
   * Can switch to editing a file.
   *
   * For now we only support editing Python files.
   *
   * @param filename The name of the file in the file list.
   */
  async canSwitchToEditing(filename: string): Promise<boolean> {
    await this.openFileActionsMenu(filename);
    const document = await this.document();
    const editButton = await document.findByRole("menuitem", {
      name: "Edit " + filename,
    });
    return !(await isDisabled(editButton));
  }

  /**
   * Uses the Files tab to delete a file.
   *
   * @param filename The filename.
   */
  async deleteFile(
    filename: string,
    dialogChoice: string = "Delete"
  ): Promise<void> {
    await this.openFileActionsMenu(filename);
    const document = await this.document();
    const button = await document.findByRole("menuitem", {
      name: "Delete " + filename,
    });
    await button.click();
    const dialogButton = await document.findByRole("button", {
      name: dialogChoice,
    });
    await dialogButton.click();
  }

  async canDeleteFile(filename: string): Promise<boolean> {
    await this.openFileActionsMenu(filename);
    const document = await this.document();
    const button = await document.findByRole("menuitem", {
      name: `Delete ${filename}`,
    });

    return !(await isDisabled(button));
  }

  /**
   * Wait for an alert, throwing if it doesn't happen.
   *
   * @param title The expected alert title.
   * @param description The expected alert description (if any).
   */
  async findAlertText(title: string, description?: string): Promise<void> {
    const document = await this.document();
    await document.findByText(title);
    if (description) {
      await document.findByText(description);
    }
    await document.findAllByRole("alert");
  }

  /**
   * Wait for the editor contents to match the given regexp, throwing if it doesn't happen.
   *
   * Only the first few lines will be visible.
   *
   * @param match The regex.
   */
  async findVisibleEditorContents(
    match: RegExp,
    options?: waitForOptions
  ): Promise<void> {
    const document = await this.document();
    let lastText: string | undefined;
    const text = () =>
      document.evaluate(() => {
        const lines = Array.from(window.document.querySelectorAll(".cm-line"));
        return lines.map((l) => (l as HTMLElement).innerText).join("\n");
      });
    return waitFor(
      async () => {
        const value = await text();
        lastText = value;
        expect(value).toMatch(match);
      },
      {
        onTimeout: (e) =>
          new Error(`Timeout waiting for ${match} but content was ${lastText}`),
        ...options,
      }
    );
  }

  /**
   * Type in the editor area.
   *
   * This will focus the editor area and type with the caret in its default position
   * (the beginning unless we've otherwise interacted with it).
   *
   * @param match The regex.
   */
  async typeInEditor(text: string): Promise<void> {
    const document = await this.document();
    const content = await document.$(".cm-content");
    if (!content) {
      throw new Error("Missing editor area");
    }
    await content.type(text);
  }

  /**
   * Edit the project name.
   *
   * @param projectName The new name.
   */
  async setProjectName(projectName: string): Promise<void> {
    const document = await this.document();
    const editButton = await document.getByRole("button", {
      name: "Edit project name",
    });
    await editButton.click();
    const input = await document.findByRole("textbox", {
      name: /Name/,
    });
    await input.type(projectName);
    const confirm = await document.findByRole("button", { name: "Confirm" });
    await confirm.click();
  }

  /**
   * Wait for the project name
   *
   * @param match
   * @returns
   */
  async findProjectName(match: string): Promise<void> {
    const text = async () => {
      const document = await this.document();
      const projectName = await document.getByTestId("project-name");
      return projectName.getNodeText();
    };
    return waitFor(async () => {
      const value = await text();
      expect(value).toEqual(match);
    });
  }

  /**
   * Trigger a download but don't wait for it to complete.
   *
   * Useful when the action is expected to fail.
   * Otherwise see waitForDownload.
   */
  async download(): Promise<void> {
    const document = await this.document();
    const downloadButton = await document.getByText("Download");
    return downloadButton.click();
  }

  /**
   * Trigger a download and wait for it to complete.
   *
   * @returns Download details.
   */
  async waitForDownload(): Promise<BrowserDownload> {
    return this.waitForDownloadOnDisk(() => this.download());
  }

  /**
   * Resets the page for a new test.
   */
  async reset() {
    let page = await this.page;
    if (!page.isClosed()) {
      page.removeAllListeners();
      await page.close();
    }
    this.page = this.createPage();
    page = await this.page;
    await page.goto("http://localhost:3000");
  }

  /**
   * Clean up, including the browser and downloads temporary folder.
   */
  async dispose() {
    await fsp.rmdir(this.downloadPath, { recursive: true });
    const page = await this.page;
    await page.browser().close();
  }

  private async selectSideBar(tabName: string) {
    const document = await this.document();
    const tab = await document.getByRole("tab", {
      name: tabName,
    });
    return tab.click();
  }

  private async document(): Promise<puppeteer.ElementHandle<Element>> {
    const page = await this.page;
    return page.getDocument();
  }

  private async waitForDownloadOnDisk(
    triggerDownload: () => Promise<void>,
    timeout: number = 5000
  ): Promise<BrowserDownload> {
    const listDir = async () => {
      const listing = await fsp.readdir(this.downloadPath);
      return new Set(listing.filter((x) => !x.endsWith(".crdownload")));
    };

    const before = await listDir();
    await triggerDownload();

    const startTime = performance.now();
    while (true) {
      const after = await listDir();
      before.forEach((x) => after.delete(x));
      if (after.size === 1) {
        const filename = after.values().next().value;
        const data = await fsp.readFile(path.join(this.downloadPath, filename));
        return { filename, data };
      }
      if (after.size > 1) {
        throw new Error("Unexpected extra file in downloads directory");
      }
      if (performance.now() - startTime > timeout) {
        throw new Error("Timeout waiting for puppeteer download");
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  private async openFileActionsMenu(filename: string): Promise<void> {
    await this.selectSideBar("Files");
    const document = await this.document();
    const actions = await document.findByRole("button", {
      name: `${filename} file actions`,
    });
    await actions.click();
  }
}

/**
 * Checks whether an element is disabled.
 *
 * @param element an element handle.
 * @returns true if the element exists and is marked disabled.
 */
const isDisabled = async (element: ElementHandle<Element>) => {
  if (!element) {
    return false;
  }
  const disabled = await element.getProperty("disabled");
  return disabled && (await disabled.jsonValue());
};
