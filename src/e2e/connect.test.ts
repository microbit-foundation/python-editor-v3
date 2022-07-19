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
    await app.confirmConnection();
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

  it("shows the micro:bit not found dialog and connects on try again", async () => {
    await app.mockDeviceConnectFailure("no-device-selected");
    await app.connect();
    await app.confirmNotFoundDialog();
    await app.connectViaTryAgain();
    await app.connectViaConnectHelp();
    await app.confirmConnection();
  });

  it("shows the micro:bit not found dialog and connects after launching the connect help dialog", async () => {
    await app.mockDeviceConnectFailure("no-device-selected");
    await app.connect();
    await app.confirmNotFoundDialog();
    await app.connectHelpFromNotFoundDialog();
    await app.connectViaConnectHelp();
    await app.confirmConnection();
  });

  it("shows the update firmware dialog and connects on try again", async () => {
    await app.mockDeviceConnectFailure("update-req");
    await app.connect();
    await app.confirmFirmwareUpdateDialog();
    await app.connectViaTryAgain();
    await app.connectViaConnectHelp();
    await app.confirmConnection();
  });

  it("Shows the transfer hex help dialog after send to micro:bit where WebUSB is not supported", async () => {
    await app.mockWebUsbNotSupported();
    await app.setProjectName("not default name");
    await app.flash();
    await app.confirmWebUsbNotSupportedDialog();
    await app.closeWebUsbNotSupportedDialog();
    await app.confirmTransferHexHelpDialog();
  });
});
