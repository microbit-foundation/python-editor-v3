import { App } from "./app";

describe("Browser - open", () => {
  const app = new App();
  beforeEach(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("Shows an alert when loading a MakeCode hex", async () => {
    await app.open("testData/makecode.hex");

    // We should improve this and reference MakeCode.
    // v2 adds some special case translatable text.
    await app.alertText(
      "Cannot load file",
      "There is data after an EOF record at record 14004"
    );
  });

  it("Loads a Python file", async () => {
    await app.open("testData/samplefile.py");

    await app.alertText("Loaded samplefile.py");
    await app.findProjectName("samplefile");
  });

  it("Loads a v1.0.1 hex file", async () => {
    await app.open("testData/1.0.1.hex");

    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  it("Loads a v0.9 hex file", async () => {
    await app.open("testData/0.9.hex");

    await app.findVisibleEditorContents(/PASS2/);
    await app.findProjectName("0.9");
  });

  it("Loads via drag and drop", async () => {
    await app.dropFile("testData/1.0.1.hex");

    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  it("Correctly handles an mpy file", async () => {
    await app.open("testData/samplempyfile.mpy");

    await app.alertText(
      "Cannot load file",
      "This version of the Python Editor doesn't currently support adding .mpy files."
    );
  });

  it("Correctly handles a file with an invalid extension", async () => {
    await app.open("testData/sampletxtfile.txt");

    await app.alertText(
      "Cannot load file",
      "The Python Editor can only load files with the .hex or .py extensions."
    );
  });

  it("Correctly imports modules with the 'magic comment' in the filesystem.", async () => {
    await app.open("testData/module.py");

    await app.alertText("Added module module.py");

    await app.open("testData/module.py");
    await app.alertText("Updated module module.py");
  });
});
