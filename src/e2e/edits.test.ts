import { App } from "./app";

describe("Browser - edits", () => {
  const app = new App();
  beforeEach(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("doesn't prompt on close if no edits made", async () => {
    expect(await app.closePageCheckDialog()).toEqual(false);
  });

  it("prompts on close if file edited", async () => {
    await app.typeInEditor("A change!");

    await app.findVisibleEditorContents(/A change/);
    expect(await app.closePageCheckDialog()).toEqual(true);
  });

  it("prompts on close if project name edited", async () => {
    const name = "idiosyncratic ruminant";
    await app.setProjectName(name);
    await app.findProjectName(name);

    expect(await app.closePageCheckDialog()).toEqual(true);
  });
});
