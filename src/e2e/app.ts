import puppeteer, { ElementHandle, Page } from "puppeteer";
import "pptr-testing-library/extend";
import * as fsp from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import { Matcher, queryHelpers, waitFor } from "@testing-library/dom";

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
 */
export class App {
  private page: Promise<Page>;
  private downloadPath = fs.mkdtempSync("puppeteer-downloads");

  constructor() {
    this.page = (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const client = await page.target().createCDPSession();
      await client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: this.downloadPath,
      });
      return page;
    })();
  }

  async open(filePath: string): Promise<void> {
    await this.selectSideBar("Files");
    const document = await this.document();
    const openInput = await document.getByTestId("open-input");
    await openInput.uploadFile(filePath);
  }

  async alertText(title: string, description: string): Promise<void> {
    const document = await this.document();
    await document.findByText(title);
    await document.findByText(description);
    await document.findAllByRole("alert");
  }

  async findVisibleEditorContents(match: RegExp): Promise<void> {
    const document = await this.document();
    const text = () =>
      document.evaluate(() => {
        const lines = Array.from(window.document.querySelectorAll(".cm-line"));
        return lines.map((l) => (l as HTMLElement).innerText).join("\n");
      });
    return waitFor(async () => {
      const value = await text();
      expect(value).toMatch(match);
    });
  }

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

  async download(): Promise<void> {
    const document = await this.document();
    const downloadButton = await document.getByText("Download");
    return downloadButton.click();
  }

  async waitForDownload(): Promise<BrowserDownload> {
    return this.waitForDownloadOnDisk(() => this.download());
  }

  async reload() {
    const page = await this.page;
    await page.goto("http://localhost:3000");
  }

  async dispose() {
    await fsp.rmdir(this.downloadPath, { recursive: true });
    const page = await this.page;
    return page.browser().close();
  }

  private async selectSideBar(text: string) {
    const document = await this.document();
    const tab = await document.getByRole("tab", {
      name: "Files",
    });
    await tab.click();
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
}
