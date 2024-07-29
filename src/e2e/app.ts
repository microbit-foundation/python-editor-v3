/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BrowserContext, Frame, Locator, Page, expect } from "@playwright/test";
import { Flag } from "../flags";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { DeviceErrorCode } from "@microbit/microbit-connection";

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
    const actionMenu = new FileActionsMenu(this.page, filename);
    await fileActionsMenu.waitFor();
    await fileActionsMenu.hover();
    await fileActionsMenu.click();
    await actionMenu.editButton.waitFor();
    return actionMenu;
  }

  async chooseFile(filePathFromProjectRoot: string) {
    const filePath = getAbsoluteFilePath(filePathFromProjectRoot);
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.openButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }
}

class SideBar {
  public expandButton: Locator;
  public collapseButton: Locator;

  constructor(public readonly page: Page) {
    this.expandButton = this.page.getByLabel("Expand sidebar");
    this.collapseButton = this.page.getByLabel("Collapse sidebar");
  }
}

class Simulator {
  public expandButton: Locator;
  public collapseButton: Locator;
  public showSerialButton: Locator;
  public hideSerialButton: Locator;
  public sendGestureButton: Locator;
  private stopButton: Locator;
  public serialMenu: Locator;
  public iframe: Locator;
  private serialArea: Locator;

  constructor(public readonly page: Page) {
    this.expandButton = this.page.getByLabel("Expand simulator");
    this.collapseButton = this.page.getByLabel("Collapse simulator");

    this.serialArea = this.page.getByRole("region", {
      name: "Serial terminal",
      exact: true,
    });
    this.serialMenu = this.getSerialAreaButton("Serial menu");
    this.showSerialButton = this.getSerialAreaButton("Show serial");
    this.hideSerialButton = this.getSerialAreaButton("Hide serial");
    this.sendGestureButton = this.page.getByRole("button", {
      name: "Send gesture",
    });
    this.stopButton = this.page.getByRole("button", {
      name: "Stop simulator",
    });
    this.iframe = this.page.locator("iframe[name='Simulator']");
  }

  private getSerialAreaButton(name: string) {
    return this.serialArea.getByRole("button", { name });
  }

  async simulatorSelectGesture(option: string): Promise<void> {
    await this.page
      .getByTestId("simulator-gesture-select")
      .selectOption(option);
  }

  // Simulator functions
  private getSimulatorIframe(): Frame {
    const simulatorIframe = this.page.frame("Simulator");
    if (!simulatorIframe) {
      throw new Error("Simulator iframe not found");
    }
    return simulatorIframe;
  }

  async run(): Promise<void> {
    const simulatorIframe = this.getSimulatorIframe();
    const playButton = simulatorIframe.locator(".play-button");
    await playButton.click();
  }

  async expectResponse(): Promise<void> {
    // Confirms that top left LED is switched on
    // to match Image.NO being displayed.
    const gridLEDs = this.getSimulatorIframe().locator("#LEDsOn");
    await expect(gridLEDs).toBeVisible();
  }

  async expectStopped(): Promise<void> {
    expect(await this.stopButton.isDisabled()).toEqual(true);
  }

  async setRangeSlider(
    sliderLabel: string,
    value: "min" | "max"
  ): Promise<void> {
    const sliderThumb = this.page.locator(
      `[role="slider"][aria-label="${sliderLabel}"]`
    );
    const bounding_box = await sliderThumb!.boundingBox();
    await this.page.mouse.move(
      bounding_box!.x + bounding_box!.width / 2,
      bounding_box!.y + bounding_box!.height / 2
    );
    await this.page.mouse.down();
    await this.page.waitForTimeout(500);
    await this.page.mouse.move(value === "max" ? 1200 : 0, 0);
    await this.page.waitForTimeout(500);
    await this.page.mouse.up();
  }

  async inputPressHold(name: string, pressDuration: number): Promise<void> {
    const inputButton = this.page.getByRole("button", {
      name,
    });
    const bounding_box = await inputButton!.boundingBox();
    await this.page.mouse.move(
      bounding_box!.x + bounding_box!.width / 2,
      bounding_box!.y + bounding_box!.height / 2
    );
    await this.page.mouse.down();
    await this.page.waitForTimeout(pressDuration);
    await this.page.mouse.up();
  }
}

export class App {
  public editorTextArea: Locator;
  private settingsButton: Locator;
  public saveButton: Locator;
  private searchButton: Locator;
  public modifierKey: string;
  public projectTab: ProjectTabPanel;
  private moreConnectionOptionsButton: Locator;
  public baseUrl: string;
  private editor: Locator;
  public simulator: Simulator;
  public sidebar: SideBar;
  public sendToMicrobitButton: Locator;

  constructor(public readonly page: Page, public context: BrowserContext) {
    this.baseUrl = baseUrl;
    this.editor = this.page.getByTestId("editor");
    this.editorTextArea = this.editor.getByRole("textbox");
    this.projectTab = new ProjectTabPanel(page);
    this.settingsButton = this.page.getByTestId("settings");
    this.saveButton = this.page.getByRole("button", {
      name: "Save",
      exact: true,
    });
    this.searchButton = this.page.getByRole("button", { name: "Search" });
    this.moreConnectionOptionsButton = this.page.getByTestId(
      "more-connect-options"
    );
    this.sendToMicrobitButton = this.page.getByRole("button", {
      name: "Send to micro:bit",
    });
    this.simulator = new Simulator(this.page);
    this.sidebar = new SideBar(this.page);

    // Set modifier key
    const isMac = process.platform === "darwin";
    this.modifierKey = isMac ? "Meta" : "Control";
  }

  async goto(options: UrlOptions = {}) {
    await this.page.goto(optionsToURL(options));
    // Wait for the page to be loaded
    await this.editor.waitFor();
  }

  async setProjectName(projectName: string): Promise<void> {
    await this.page.getByRole("button", { name: "Edit project name" }).click();
    await this.page.getByLabel("Name*").fill(projectName);
    await this.page.getByRole("button", { name: "Confirm" }).click();
  }

  async expectProjectName(match: string) {
    await expect(this.page.getByTestId("project-name")).toHaveText(match);
  }

  async switchLanguage(locale: string) {
    // All test ids so they can be language invariant.
    await this.settingsButton.click();
    await this.page.getByTestId("language").click();
    await this.page.getByTestId(locale).click();
  }

  async selectAllInEditor(): Promise<void> {
    await this.editorTextArea.click();
    await this.page.keyboard.press(`${this.modifierKey}+A`);
  }

  async pasteInEditor() {
    // Simulating keyboard press CTRL+V works in Playwright,
    // but does not work in this case potentially due to
    // CodeMirror pasting magic
    const clipboardText: string = await this.page.evaluate(
      "navigator.clipboard.readText()"
    );
    await this.editorTextArea.evaluate((el, text) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", text);
      const clipboardEvent = new ClipboardEvent("paste", { clipboardData });
      el.dispatchEvent(clipboardEvent);
    }, clipboardText);
  }

  async typeInEditor(text: string): Promise<void> {
    const numCharTyped = 2;
    const textWithoutLastChars = text.slice(0, -numCharTyped);
    const lastChars = text.slice(-numCharTyped);
    await this.editorTextArea.fill(textWithoutLastChars);
    // Last few characters are typed separately and slower to
    // reliably trigger editor suggestions
    for (const char of lastChars) {
      await this.page.keyboard.press(char, { delay: 500 });
    }
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

  async expectEditorContainText(match: RegExp | string) {
    // Scroll to the top of code text area
    await this.editorTextArea.click();
    await this.page.mouse.wheel(0, -100000000);
    await expect(this.editorTextArea).toContainText(match);
  }

  async expectProjectFiles(expected: string[]): Promise<void> {
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

    // Wait for page to load
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

  async expectAlertText(title: string, description?: string): Promise<void> {
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

  async editFile(filename: string): Promise<void> {
    await this.switchTab("Project");
    const fileOptionMenu = await this.projectTab.openFileActionsMenu(filename);
    await fileOptionMenu.editButton.click();
  }

  async expectThirdPartModuleWarning(
    expectedName: string,
    expectedVersion: string
  ): Promise<void> {
    for (const name in [expectedName, expectedVersion]) {
      await expect(this.page.getByRole("cell", { name })).toBeVisible();
    }
  }

  async closeDialog(dialogText?: string) {
    if (dialogText) {
      await this.page.getByText(dialogText).waitFor();
    }
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

  async savePythonScript() {
    await this.page.getByTestId("more-save-options").click();
    const downloadPromise = this.page.waitForEvent("download");
    await this.page
      .getByRole("menuitem", { name: "Save Python script" })
      .click();
    await downloadPromise;
  }

  async expectDialog(text: string) {
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

  async closeAndExpectBeforeUnloadDialogVisible(
    visible: boolean
  ): Promise<void> {
    if (visible) {
      this.page.on("dialog", async (dialog) => {
        expect(dialog.type() === "beforeunload").toEqual(visible);

        // Though https://playwright.dev/docs/api/class-page#page-event-dialog
        // says that dialog.dismiss() is needed otherwise the page will freeze,
        // in practice, it appears that the dialog is dismissed automatically.
      });
    }
    await this.page.close({ runBeforeUnload: true });
  }

  async expectDocumentationTopLevelHeading(
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
    const editorLine = this.editor
      .getByRole("textbox")
      .locator("div")
      .filter({ hasText: targetLine.toString() });

    await codeExample.dragTo(editorLine);
  }

  async search(searchText: string): Promise<void> {
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

  async connect(): Promise<void> {
    await this.moreConnectionOptionsButton.click();
    await this.page.getByRole("menuitem", { name: "Connect" }).click();
    await this.connectViaConnectHelp();
  }

  async disconnect(): Promise<void> {
    await this.moreConnectionOptionsButton.click();
    await this.page.getByRole("menuitem", { name: "Disconnect" }).click();
  }

  // Connects from the connect dialog/wizard.
  async connectViaConnectHelp(): Promise<void> {
    await this.page.getByRole("button", { name: "Next" }).click();
    await this.page.getByRole("button", { name: "Next" }).click();
  }

  async expectConnected(): Promise<void> {
    await expect(this.simulator.serialMenu).toBeVisible();
  }

  async expectDisconnected(): Promise<void> {
    const btns = await this.page
      .getByRole("button", { name: "Serial terminal" })
      .all();
    expect(btns.length).toEqual(0);
  }

  async mockSerialWrite(data: string): Promise<void> {
    this.page.evaluate((data) => {
      (window as any).mockDevice.mockSerialWrite(data);
    }, toCrLf(data));
  }

  async followSerialCompactTracebackLink(): Promise<void> {
    await this.page.getByTestId("traceback-link").click();
  }

  async mockDeviceConnectFailure(code: DeviceErrorCode) {
    this.page.evaluate((code) => {
      (window as any).mockDevice.mockConnect(code);
    }, code);
  }

  async expectSerialCompactTraceback(text: string | RegExp): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  // Retry micro:bit connection from error dialogs.
  async connectViaTryAgain(): Promise<void> {
    await this.page.getByRole("button", { name: "Try again" }).click();
  }

  // Launch 'connect help' dialog from 'not found' dialog.
  async connectHelpFromNotFoundDialog(): Promise<void> {
    await this.page.getByRole("link", { name: "follow these steps" }).click();
  }

  async mockWebUsbNotSupported() {
    this.page.evaluate(() => {
      (window as any).mockDevice.mockWebUsbNotSupported();
    });
  }

  async expectCompletionOptions(expected: string[]): Promise<void> {
    const completions = this.page.getByRole("listbox", { name: "Completions" });
    await completions.waitFor();
    const contents = await completions.innerText();
    expect(contents).toEqual(expected.join("\n"));
  }

  async expectCompletionActiveOption(signature: string): Promise<void> {
    const activeOption = this.editor
      .locator("div")
      .filter({ hasText: signature })
      .nth(2);
    await activeOption.waitFor();
    await expect(activeOption).toBeVisible();
  }

  async acceptCompletion(name: string): Promise<void> {
    // This seems significantly more reliable than pressing Enter, though there's
    // no real-life issue here.
    const option = this.editor.getByRole("option", { name });
    await option.waitFor();
    await option.click();
  }

  async followCompletionOrSignatureDocumentionLink(
    linkName: "Help" | "API"
  ): Promise<void> {
    await this.page.getByRole("link", { name: linkName }).click();
  }

  async expectActiveApiEntry(text: string): Promise<void> {
    // We need to make sure it's actually visible as it's scroll-based navigation.
    await expect(this.page.getByRole("heading", { name: text })).toBeVisible();
  }

  async expectSignatureHelp(expectedSignature: string): Promise<void> {
    const signatureHelp = this.editor
      .locator("div")
      .filter({ hasText: expectedSignature })
      .nth(1);
    await signatureHelp.waitFor();
    await expect(signatureHelp).toBeVisible();
  }

  async expectFocusOnLoad(): Promise<void> {
    const link = this.page.getByLabel(
      "visit microbit.org (opens in a new tab)"
    );
    await this.page.keyboard.press("Tab");
    await expect(link).toBeFocused();
  }

  async assertFocusOnSidebar(): Promise<void> {
    const simulator = this.page.getByRole("tabpanel", { name: "Reference" });
    await expect(simulator).toBeFocused();
  }

  async assertFocusBeforeEditor(): Promise<void> {
    const zoomIn = this.page.getByRole("button", {
      name: "Zoom in",
    });
    await expect(zoomIn).toBeFocused();
  }

  async assertFocusAfterEditor(): Promise<void> {
    await expect(this.sendToMicrobitButton).toBeFocused();
  }

  async tabOutOfEditorForwards(): Promise<void> {
    await this.editor.click();
    await this.page.keyboard.press("Escape");
    await this.page.keyboard.press("Tab");
  }

  async tabOutOfEditorBackwards(): Promise<void> {
    await this.editor.click();
    await this.page.keyboard.press("Escape");
    await this.page.keyboard.down("Shift");
    await this.page.keyboard.press("Tab");
    await this.page.keyboard.up("Shift");
  }
}

const toCrLf = (text: string): string =>
  text.replace(/[\r\n]/g, "\n").replace(/\n/g, "\r\n");

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
