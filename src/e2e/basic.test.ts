import puppeteer from "puppeteer";
import "pptr-testing-library/extend";

describe("Toolbar actions", () => {
  it("Download - downloads a HEX file", async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto("http://localhost:3000");
    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: "/tmp",
    });

    const document = await page.getDocument();
    const downloadButton = await document.getByText("Download");
    await downloadButton.click();
    // TODO: wait for download, check file

    browser.close();
  });
});
