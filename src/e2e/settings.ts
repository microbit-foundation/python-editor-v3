import { App } from "./app";

describe("Browser - settings", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterAll(app.dispose.bind(app));

  it("shows the settings dialog when the button is clicked", async () => {
    // new methods needed in app.tsx to support this!
    // E.g. app.openSettingsDialog();
    await app.openSettingsDialog();
    await app.closeSettingsDialog();
  });
});
