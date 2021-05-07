import { App, BrowserMode } from "./app";

// Allow tests to perform full flashes.
jest.setTimeout(60_000);

if (process.env.TEST_MODE_DEVICE) {
  describe("Browser - flash", () => {
    const app = new App(BrowserMode.NORMAL_WITH_WEBUSB);
    beforeEach(app.reset.bind(app));
    afterAll(app.dispose.bind(app));

    it("connects, flashes, disconnects", async () => {
      await app.connect();
      try {
        await app.flash();
      } finally {
        await app.disconnect();
      }
    });
  });
} else {
  describe.skip("Browser - flash", () => {});
}
