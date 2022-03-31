/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

const traceback = `Traceback (most recent call last):
  File "main.py", line 6
SyntaxError: invalid syntax
`; // Needs trailing newline!

describe("Browser - WebUSB (mocked)", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
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

  it("shows summary of traceback from serial", async () => {
    await app.connect();
    await app.flash();
    await app.mockSerialWrite(traceback);

    await app.findSerialCompactTraceback(/SyntaxError: invalid syntax/);
  });

  it("supports navigating to line from traceback", async () => {
    await app.connect();
    await app.flash();
    await app.mockSerialWrite(traceback);

    await app.followSerialCompactTracebackLink();

    // No good options yet for asserting editor line.
  });
});
