/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

const traceback = `Traceback (most recent call last):
  File "main.py", line 6
SyntaxError: invalid syntax
`; // Needs trailing newline!

test.describe("connect", () => {
  test("shows serial when connected", async ({ app }) => {
    // Connect and disconnect wait for serial to be shown/hidden
    await app.connect();
    await app.confirmConnection();
    await app.disconnect();
  });

  test("can expand serial to show full output", async ({ app }) => {
    await app.connect();

    await app.serialShow();

    await app.serialHide();
  });

  test("shows summary of traceback from serial", async ({ app }) => {
    await app.connect();
    await app.flash();
    await app.mockSerialWrite(traceback);

    await app.findSerialCompactTraceback(/SyntaxError: invalid syntax/);
  });

  test("supports navigating to line from traceback", async ({ app }) => {
    await app.connect();
    await app.flash();
    await app.mockSerialWrite(traceback);

    await app.followSerialCompactTracebackLink();

    // No good options yet for asserting editor line.
  });

  test("shows the micro:bit not found dialog and connects on try again", async ({
    app,
  }) => {
    await app.mockDeviceConnectFailure("no-device-selected");
    await app.connect();
    await app.confirmInputDialog("No micro:bit found");
    await app.connectViaTryAgain();
    await app.connectViaConnectHelp();
    await app.confirmConnection();
  });

  test("shows the micro:bit not found dialog and connects after launching the connect help dialog", async ({
    app,
  }) => {
    await app.mockDeviceConnectFailure("no-device-selected");
    await app.connect();
    await app.confirmInputDialog("No micro:bit found");
    await app.connectHelpFromNotFoundDialog();
    await app.connectViaConnectHelp();
    await app.confirmConnection();
  });

  test("shows the update firmware dialog and connects on try again", async ({
    app,
  }) => {
    await app.mockDeviceConnectFailure("update-req");
    await app.connect();
    await app.confirmInputDialog("Firmware update required");
    await app.connectViaTryAgain();
    await app.connectViaConnectHelp();
    await app.confirmConnection();
  });

  test("Shows the transfer hex help dialog after send to micro:bit where WebUSB is not supported", async ({
    app,
  }) => {
    await app.mockWebUsbNotSupported();
    await app.setProjectName("not default name");
    await app.flash();
    await app.confirmInputDialog("This browser does not support WebUSB");
    await app.closeDialog();
    await app.confirmInputDialog("Transfer saved hex file to micro:bit");
  });
});
