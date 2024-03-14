/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Locator, Page, expect } from "@playwright/test";
import { Flag } from "../flags";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

export enum LoadDialogType {
  CONFIRM,
  REPLACE,
  CONFIRM_BUT_LOAD_AS_MODULE,
  NONE,
}

export interface BrowserDownload {
  filename: string;
  data: Buffer;
}

const baseUrl = "http://localhost:3000";

interface UrlOptions {
  flags?: Flag[];
  fragment?: string;
  language?: string;
}

interface SaveOptions {
  waitForDownload: boolean;
}

class LoadDialog {
  private confirmButton: Locator;
  private replaceButton: Locator;
  private optionsButton: Locator;
  private type: LoadDialogType;

  constructor(public readonly page: Page, type: LoadDialogType) {
    this.type = type;
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
    this.replaceButton = this.page.getByRole("button", { name: "Replace" });
    this.optionsButton = this.page.getByRole("button", {
      name: "Options",
      exact: true,
    });
  }

  async submit() {
    switch (this.type) {
      case LoadDialogType.CONFIRM:
        return await this.confirmButton.click();
      case LoadDialogType.REPLACE:
        return await this.replaceButton.click();
      case LoadDialogType.CONFIRM_BUT_LOAD_AS_MODULE:
        await this.optionsButton.click();
        await this.page.getByText(/^(Add|Replace) file .+\.py$/).click();
        return await this.confirmButton.click();
      default:
        return;
    }
  }
}

class FileActionsMenu {
  public saveButton: Locator;
  public editButton: Locator;
  public deleteButton: Locator;

  constructor(public readonly page: Page, filename: string) {
    this.saveButton = this.page.getByRole("menuitem", {
      name: `Save ${filename}`,
    });
    this.editButton = this.page.getByRole("menuitem", {
      name: `Edit ${filename}`,
    });
    this.deleteButton = this.page.getByRole("menuitem", {
      name: `Delete ${filename}`,
    });
  }

  async delete() {
    await this.deleteButton.waitFor();
    await this.deleteButton.click();
    await this.page.getByRole("button", { name: "Delete" }).click();
  }
}

class ProjectTabPanel {
  private openButton: Locator;
  constructor(public readonly page: Page) {
    this.openButton = this.page
      .getByRole("tabpanel", { name: "Project" })
      .getByTestId("open");
  }

  async openFileActionsMenu(filename: string) {
    const fileActionsMenu = this.page.getByRole("button", {
      name: `${filename} file actions`,
    });
    await fileActionsMenu.waitFor();
    await fileActionsMenu.click();
    return new FileActionsMenu(this.page, filename);
  }

  async chooseFile(filePathFromProjectRoot: string) {
    const filePath = getAbsoluteFilePath(filePathFromProjectRoot);
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.openButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }
}

export class App {
  public editorTextArea: Locator;
  private settingsButton: Locator;
  public saveButton: Locator;
  private searchButton: Locator;
  public modifierKey: string;
  public projectTab: ProjectTabPanel;

  constructor(public readonly page: Page) {
    this.editorTextArea = this.page.getByTestId("editor").getByRole("textbox");
    this.projectTab = new ProjectTabPanel(page);
    this.settingsButton = this.page.getByTestId("settings");
    this.saveButton = this.page.getByRole("button", {
      name: "Save",
      exact: true,
    });
    this.searchButton = this.page.getByRole("button", { name: "Search" });
    const isMac = process.platform === "darwin";
    this.modifierKey = isMac ? "Meta" : "Control";
  }

  async goto(options: UrlOptions = {}) {
    await this.page.goto(optionsToURL(options));
  }

  // TODO: Rename to expectProjectName
  async findProjectName(match: string) {
    await expect(
      this.page.getByTestId("project-name").getByText(match)
    ).toBeVisible();
  }

  async switchLanguage(locale: string) {
    // All test ids so they can be language invariant.
    await this.settingsButton.click();
    await this.page.getByTestId("language").click();
    await this.page.getByTestId(locale).click();
  }

  async setProjectName(projectName: string): Promise<void> {
    await this.page.getByRole("button", { name: "Edit project name" }).click();
    await this.page.getByLabel("Name*").fill(projectName);
    await this.page.getByRole("button", { name: "Confirm" }).click();
  }

  async selectAllInEditor(): Promise<void> {
    await this.editorTextArea.click();
    await this.page.keyboard.press(`${this.modifierKey}+A`);
  }

  // TODO: Rename to pasteInEditor
  async pasteToolkitCode() {
    // Simulating keyboard press CTRL+V works in Playwright,
    // but does not work in this case potentially due to
    // CodeMirror pasting magic
    const clipboardText: string = await this.page.evaluate(
      "navigator.clipboard.readText()"
    );
    await this.editorTextArea.evaluate((el, clipboardText1) => {
      const text = clipboardText1;
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", text);
      const clipboardEvent = new ClipboardEvent("paste", {
        clipboardData,
      });
      el.dispatchEvent(clipboardEvent);
    }, clipboardText);
  }

  async typeInEditor(text: string): Promise<void> {
    await this.editorTextArea.fill(text);
  }

  async switchTab(tabName: "Project" | "API" | "Reference" | "Ideas") {
    await this.page.getByRole("tab", { name: tabName }).click();
  }

  async createNewFile(name: string): Promise<void> {
    await this.switchTab("Project");
    await this.page.getByRole("button", { name: "Create file" }).click();
    await this.page.getByLabel("Name*").fill(name);
    await this.page.getByRole("button", { name: "Create" }).click();
  }

  async resetProject(): Promise<void> {
    await this.switchTab("Project");
    await this.page.getByRole("button", { name: "Reset project" }).click();
    await this.page.getByRole("button", { name: "Replace" }).click();
  }

  // TODO: Rename to expectEditorContentsContain
  // Use allInnerTexts() for matching text
  async findVisibleEditorContents(match: RegExp | string) {
    // Scroll to the top of code text area
    await this.editorTextArea.click();
    await this.page.mouse.wheel(0, -100000000);
    return expect(this.editorTextArea).toContainText(match);
  }

  // TODO: Rename to expectProjectFiles
  async findProjectFiles(expected: string[]): Promise<void> {
    await this.switchTab("Project");
    await expect(this.page.getByRole("listitem")).toHaveText(expected);
  }

  async loadFiles(
    filePathFromProjectRoot: string,
    options: { acceptDialog?: LoadDialogType } = {}
  ) {
    await this.switchTab("Project");
    await this.projectTab.chooseFile(filePathFromProjectRoot);

    if (options.acceptDialog !== undefined) {
      const loadDialog = new LoadDialog(this.page, options.acceptDialog);
      await loadDialog.submit();
    }
  }

  async dropFile(
    filePathFromProjectRoot: string,
    options: { acceptDialog?: LoadDialogType } = {}
  ) {
    const filePath = getAbsoluteFilePath(filePathFromProjectRoot);
    const filename = getFilename(filePathFromProjectRoot);

    // wait for page to load
    await this.saveButton.waitFor();

    // Playwright drag and drop file method taken from
    // https://github.com/microsoft/playwright/issues/10667#issuecomment-998397241
    const buffer = readFileSync(filePath, { encoding: "ascii" });
    const dataTransfer = await this.page.evaluateHandle(
      ({ buffer, filename }) => {
        const dt = new DataTransfer();
        const file = new File([buffer], filename);
        dt.items.add(file);
        return dt;
      },
      { buffer, filename }
    );

    // Drag file over target area to reveal drop zone
    await this.page
      .getByTestId("project-drop-target")
      .dispatchEvent("dragover", { dataTransfer });

    const dropZone = this.page.getByTestId("project-drop-target-overlay");
    await dropZone.waitFor();
    await dropZone.dispatchEvent("drop", { dataTransfer });

    if (options.acceptDialog !== undefined) {
      const loadDialog = new LoadDialog(this.page, options.acceptDialog);
      await loadDialog.submit();
    }
  }

  // TODO: Rename to expectAlertText
  async findAlertText(title: string, description?: string): Promise<void> {
    await expect(this.page.getByText(title)).toBeVisible();
    if (description) {
      await expect(this.page.getByText(description)).toBeVisible();
    }
  }

  async isDeleteFileOptionDisabled(filename: string) {
    await this.switchTab("Project");
    const fileOptionMenu = await this.projectTab.openFileActionsMenu(filename);
    return await fileOptionMenu.deleteButton.isDisabled();
  }

  async isEditFileOptionDisabled(filename: string) {
    await this.switchTab("Project");
    const fileOptionMenu = await this.projectTab.openFileActionsMenu(filename);
    return await fileOptionMenu.editButton.isDisabled();
  }

  // TODO: Rename to editFile
  async switchToEditing(filename: string): Promise<void> {
    await this.switchTab("Project");
    const fileOptionMenu = await this.projectTab.openFileActionsMenu(filename);
    await fileOptionMenu.editButton.click();
  }

  async findThirdPartyModuleWarning(
    expectedName: string,
    expectedVersion: string
  ): Promise<void> {
    for (const name in [expectedName, expectedVersion]) {
      await expect(this.page.getByRole("cell", { name })).toBeVisible();
    }
  }

  async closeDialog(dialogText: string) {
    await this.page.getByText(dialogText).waitFor();
    await this.page.getByRole("button", { name: "Close" }).first().click();
  }

  async save(options: SaveOptions = { waitForDownload: true }) {
    if (!options.waitForDownload) {
      await this.saveButton.click();
      return;
    }
    const downloadPromise = this.page.waitForEvent("download");
    await this.saveButton.click();
    return await downloadPromise;
  }

  // TODO: Rename to savePythonScript
  async saveMain() {
    await this.page.getByTestId("more-save-options").click();
    const downloadPromise = this.page.waitForEvent("download");
    await this.page
      .getByRole("menuitem", { name: "Save Python script" })
      .click();
    await downloadPromise;
  }

  // TODO: Rename to expectDialog
  async confirmInputDialog(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async deleteFile(filename: string) {
    await this.switchTab("Project");
    const fileOptionMenu = await this.projectTab.openFileActionsMenu(filename);
    await fileOptionMenu.delete();
  }

  async toggleSettingThirdPartyModuleEditing(): Promise<void> {
    await this.settingsButton.click();
    await this.page.getByRole("menuitem", { name: "Settings" }).click();
    await this.page
      .getByText("Allow editing third-party modules", { exact: true })
      .click();
    await this.page.getByRole("button", { name: "Close" }).click();
  }

  // Rename to closeAndExpectBeforeUnloadDialogVisible
  async closePageCheckDialog(visible: boolean): Promise<void> {
    this.page.on("dialog", async (dialog) => {
      expect(dialog.type() === "beforeunload").toEqual(visible);
      await dialog.dismiss();
    });
    await this.page.close({ runBeforeUnload: true });
  }

  // Rename to expectDocumentationTopLevelHeading
  async findDocumentationTopLevelHeading(
    title: string,
    description?: string
  ): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: title, exact: true })
    ).toBeVisible();
    if (description) {
      await expect(this.page.getByText(description)).toBeVisible();
    }
  }

  async selectDocumentationSection(name: string): Promise<void> {
    await this.page.getByRole("heading", { name }).click();
  }

  // Rename srollToTop
  async triggerScroll(_tabName: string) {
    await this.page.mouse.wheel(0, -100000000);
  }

  async toggleCodeActionButton(name: string): Promise<void> {
    await this.page
      .getByRole("listitem")
      .filter({ hasText: name })
      .getByRole("button", { name: "More" })
      .click();
  }

  async selectToolkitDropDownOption(
    label: string,
    option: string
  ): Promise<void> {
    await this.page.getByRole("combobox", { name: label }).selectOption(option);
  }

  private getCodeExample(name: string) {
    return this.page
      .getByRole("listitem")
      .filter({ hasText: name })
      .locator("div")
      .filter({
        hasText: "Code example:",
      })
      .nth(2);
  }

  async copyCode(name: string) {
    await this.getCodeExample(name).click();
    await this.page.getByRole("button", { name: "Copy code" }).click();
  }

  async dragDropCodeEmbed(name: string, targetLine: number) {
    const codeExample = this.getCodeExample(name);
    const editorLine = this.page
      .getByTestId("editor")
      .getByRole("textbox")
      .locator("div")
      .filter({ hasText: targetLine.toString() });

    await codeExample.dragTo(editorLine);
  }

  // TODO: Rename to search
  async searchToolkits(searchText: string): Promise<void> {
    await this.switchTab("Reference");
    await this.searchButton.click();
    await this.page.getByPlaceholder("Search").fill(searchText);
  }

  async selectFirstSearchResult(): Promise<void> {
    // wait for results to show
    await this.page.getByRole("link").first().waitFor();
    const links = await this.page.getByRole("link").all();
    await links[0].click();
  }

  async selectDocumentationIdea(name: string): Promise<void> {
    await this.page.getByRole("button", { name }).click();
  }
}

export const getFilename = (filePath: string) => {
  const filename = filePath.split("/").pop();
  if (!filename) {
    throw new Error("dropFile Error: No filename found!");
  }
  return filename;
};

const getAbsoluteFilePath = (filePathFromProjectRoot: string) => {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  return path.join(dir.replace("src/e2e", ""), filePathFromProjectRoot);
};

const optionsToURL = (options: UrlOptions): string => {
  const flags = new Set<string>([
    "none",
    "noWelcome",
    ...(options.flags ?? []),
  ]);
  const params: Array<[string, string]> = Array.from(flags).map((f) => [
    "flag",
    f,
  ]);
  if (options.language) {
    params.push(["l", options.language]);
  }
  return (
    baseUrl +
    // We didn't use BASE_URL here as CRA seems to set it to "" before running jest.
    // Maybe can be changed since the Vite upgrade.
    (process.env.E2E_BASE_URL ?? "/") +
    "?" +
    new URLSearchParams(params) +
    (options.fragment ?? "")
  );
};
