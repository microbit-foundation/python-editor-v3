import { App } from "./app";

describe("Toolbar actions", () => {
  const app = new App();

  beforeAll(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("Download - download the default HEX file", async () => {
    await app.download();
  });
});
