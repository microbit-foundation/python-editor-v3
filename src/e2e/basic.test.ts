import { App } from "./app";

describe("Toolbar actions", () => {
  const app = new App();

  beforeAll(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("Download - download the default HEX file", async () => {
    const download = await app.download();

    expect(download.filename).toEqual("my program.hex");
  });
});
