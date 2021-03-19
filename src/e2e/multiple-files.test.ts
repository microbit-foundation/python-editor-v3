import { App } from "./app";

describe("Browser - multiple and missing file cases", () => {
  const app = new App();
  beforeEach(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("Copes with hex with no Python files", async () => {});

  it("Prevents deleting main.py", async () => {});

  it("Copes with currently open file being updated", async () => {});

  it("Copes with currently open file being deleted", async () => {});

  it("Doesn't offer editor for non-Python file", async () => {});

  it("Shows some kind of error for UTF-8 main.py", async () => {});
});
