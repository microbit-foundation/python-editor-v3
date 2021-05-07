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
    // Speculative: Allow time for change to be persisted
    // See https://github.com/microbit-foundation/python-editor-next/issues/107
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    await app.reloadPage();

    await app.findVisibleEditorContents(/A change/);
  });
});
