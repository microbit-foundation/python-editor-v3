import { App } from "./app";

describe("Browser - multiple and missing file cases", () => {
  const app = new App();
  beforeEach(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("Copes with hex with no Python files", async () => {});

  it("Prevents deleting main.py", async () => {});

  it("Copes with currently open file being updated (module)", async () => {
    await app.open("testData/module.py");
    await app.switchToEditing("module.py");
    await app.findVisibleEditorContents(/1.0.0/);

    await app.open("testData/updated/module.py");

    await app.findVisibleEditorContents(/1.1.0/);
    await app.findVisibleEditorContents(/Now with documentation/);
  });

  it("Copes with currently open file being deleted", async () => {});

  it("Doesn't offer editor for non-Python file", async () => {});

  it("Shows some kind of error for UTF-8 main.py", async () => {});
});
