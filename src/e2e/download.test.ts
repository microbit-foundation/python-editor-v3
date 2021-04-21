import { App, LoadDialogType } from "./app";

describe("Browser - download", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterAll(app.dispose.bind(app));

  it("Download - download the default HEX file", async () => {
    await app.setProjectName("idiosyncratic ruminant");
    const download = await app.waitForDownload();

    expect(download.filename).toEqual("idiosyncratic ruminant.hex");
    expect(download.data.toString("ascii")).toMatch(/^:020000040000FA/);
  });

  it("Shows an error when trying to download a hex file if the Python code is too large", async () => {
    await app.loadFiles("testData/too-large.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    await app.findVisibleEditorContents(/# Filler/);
    await app.download();

    await app.findAlertText(
      "Failed to build the hex file",
      "There is no storage space left."
    );
  });
});
