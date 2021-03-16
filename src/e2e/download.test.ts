import { App } from "./app";

describe("Browser - download", () => {
  const app = new App();
  beforeAll(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("Download - download the default HEX file", async () => {
    const download = await app.waitForDownload();

    expect(download.filename).toEqual("my program.hex");
    expect(download.data.toString("ascii")).toMatch(/^:020000040000FA/);
  });

  it("Shows an error when trying to download a hex file if the Python code is too large", async () => {
    await app.open("testData/too-large.py");

    await app.findVisibleEditorContents(/# Filler/);
    await app.findProjectName("too-large");
    await app.download();

    await app.alertText(
      "Failed to build the hex file",
      "There is no storage space left."
    );
  });
});
