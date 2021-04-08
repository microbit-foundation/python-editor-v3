import { App } from "./app";

describe("Browser - edits", () => {
  const app = new App();
  beforeEach(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("doesn't prompt on close if no edits made", async () => {
    await app.closePage();
  });

  it("prompts on close if project name edited", async () => {
    await app.setProjectName("idiosyncratic ruminant");
  });

  it("prompts on close if file edited", async () => {
    // TODO: need a way to make an edit!
  });
});
