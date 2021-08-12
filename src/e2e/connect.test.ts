/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("Browser - WebUSB (mocked)", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterAll(app.dispose.bind(app));

  it("shows serial when connected", async () => {
    // Connect and disconnect wait for serial to be shown/hidden
    await app.connect();
    await app.disconnect();
  });

  it("can expand serial to show full output", async () => {
    await app.connect();

    await app.serialShow();

    await app.serialHide();
  });

  it.only("shows summary of traceback from serial", async () => {
    await app.connect();

    await app.mockSerialWrite(`Traceback (most recent call last):
    File "main.py", line 6
  SyntaxError: invalid syntax`);

    await app.followSerialCompactTracebackLink();
    // await app.findSerialCompactTraceback("line 6 SyntaxError: invalid syntax");
  });

  it("supports navigating to line from traceback", () => {});

  it("supports navigating across file from traceback", () => {});

  it("copes when traceback refers to file/line that's gone", () => {});
});
