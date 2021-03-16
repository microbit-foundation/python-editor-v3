import puppeteer, { Page } from "puppeteer";
import "pptr-testing-library/extend";
import * as fsp from "fs/promises";
import * as fs from "fs";
import * as path from "path";

export interface DownloadInfo {
  filename: string;
  data: Buffer;
}

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

  async download(): Promise<DownloadInfo> {
    const page = await this.page;
    const document = await page.getDocument();
    const downloadButton = await document.getByText("Download");
    return this.waitForDownload(() => downloadButton.click());
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

  private async waitForDownload(
    triggerDownload: () => Promise<void>,
    timeout: number = 5000
  ): Promise<DownloadInfo> {
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
