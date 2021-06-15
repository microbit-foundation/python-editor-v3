/**
 * @jest-environment node
 *
 * Without node environment USB code fails with a buffer type check.
 * It might be we could create a custom environment that was web but
 * with a tweak to Buffer.
 */
import {
  ConnectionStatus,
  EVENT_STATUS,
  MicrobitWebUSBConnection,
} from "./device";
import { USB } from "webusb";
import { NullLogging } from "../deployment/default/logging";

const describeDeviceOnly = process.env.TEST_MODE_DEVICE
  ? describe
  : describe.skip;

describe("MicrobitWebUSBConnection (WebUSB unsupported)", () => {
  it("notices if WebUSB isn't supported", () => {
    (global as any).navigator = {};
    const microbit = new MicrobitWebUSBConnection({
      logging: new NullLogging(),
    });
    expect(microbit.status).toBe(ConnectionStatus.NOT_SUPPORTED);
  });
});

describeDeviceOnly("MicrobitWebUSBConnection (WebUSB supported)", () => {
  beforeAll(() => {
    // Maybe we can move this to a custom jest environment?
    (global as any).navigator = {
      usb: new USB({}),
    };
  });

  it("shows no device as initial status", () => {
    const microbit = new MicrobitWebUSBConnection();
    expect(microbit.status).toBe(ConnectionStatus.NO_AUTHORIZED_DEVICE);
  });

  it("connects and disconnects updating status and events", async () => {
    const events: ConnectionStatus[] = [];
    const connection = new MicrobitWebUSBConnection();
    connection.on(EVENT_STATUS, (status: ConnectionStatus) =>
      events.push(status)
    );

    await connection.connect();

    expect(connection.status).toEqual(ConnectionStatus.CONNECTED);
    expect(events).toEqual([ConnectionStatus.CONNECTED]);

    // without this it breaks! something is up!
    await new Promise((resolve) => setTimeout(resolve, 100));
    await connection.disconnect();
    connection.dispose();

    expect(connection.status).toEqual(ConnectionStatus.NOT_CONNECTED);
    expect(events).toEqual([
      ConnectionStatus.CONNECTED,
      ConnectionStatus.NOT_CONNECTED,
    ]);
  });

  it("flashes using partial flashing when possible", async () => {
    // Flash MakeCode hex that outputs serial.
    // Flash MicroPython hex that outputs serial.
    // Flash another MicroPython hex, assert that we got a small number of progress events.
    // I think we need to rejig the interface to get flash data before writing this.
  });

  it("connects to flash and stays connected afterwards", () => {
    // Is this actually sensible?
  });

  it("fires a serial reset event when stopping serial", () => {});

  it("reinstates serial after flashing", () => {});

  it("serial echo test", async () => {
    // Flash a hex that echos serial
    // Use serialWrite to write serial data.
    // Assert same content is received.
    // Useful to test unicode?
  });

  it("notices disconnects and updates status", () => {
    // Might need a mock-style tests for this.
  });

  // Is it feasible to test many of the error cases?
  // I think we'd need to pass a mock DAPWrapper.
});
