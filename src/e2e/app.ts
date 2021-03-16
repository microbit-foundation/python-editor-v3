import puppeteer, { Page } from "puppeteer";
import "pptr-testing-library/extend";

export class App {
  private page: Promise<Page>;

  constructor() {
    this.page = (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const client = await page.target().createCDPSession();
      await client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: "/tmp",
      });
      return page;
    })();
  }

  async download() {
    const page = await this.page;
    const document = await page.getDocument();
    const downloadButton = await document.getByText("Download");
    await downloadButton.click();
  }

  async reload() {
    const page = await this.page;
    await page.goto("http://localhost:3000");
  }

  async dispose() {
    return (await this.page).browser().close();
  }
}
