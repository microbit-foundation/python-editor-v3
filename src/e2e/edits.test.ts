import { App } from "./app";

describe("Browser - edits", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
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

  it("retains text across a reload via session storage", async () => {
    await app.typeInEditor("A change!");
    await app.findVisibleEditorContents(/A change/);

    await app.reloadPage();

    await app.findVisibleEditorContents(/A change/, {
      timeout: 2_000,
    });
  });
});
