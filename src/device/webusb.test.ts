/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * @jest-environment node
 *
 * Without node environment USB code fails with a buffer type check.
 * It might be we could create a custom environment that was web but
 * with a tweak to Buffer.
 */
import { ConnectionStatus, ConnectionStatusEvent } from "./device";
import { NullLogging } from "../deployment/default/logging";
import { MicrobitWebUSBConnection } from "./webusb";
import { vi } from "vitest";

vi.mock("./dap-wrapper", () => ({
  DAPWrapper: class DapWrapper {
    startSerial = vi.fn().mockReturnValue(Promise.resolve());
    reconnectAsync = vi.fn();
  },
}));

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
    const usb = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestDevice() {
        const device = {};
        return device;
      },
    };
    // Maybe we can move this to a custom jest environment?
    (global as any).navigator = {
      usb,
    };
  });

  it("shows no device as initial status", () => {
    const microbit = new MicrobitWebUSBConnection();
    expect(microbit.status).toBe(ConnectionStatus.NO_AUTHORIZED_DEVICE);
  });

  it("connects and disconnects updating status and events", async () => {
    const events: ConnectionStatus[] = [];
    const connection = new MicrobitWebUSBConnection();
    connection.addEventListener("status", (event: ConnectionStatusEvent) => {
      events.push(event.status);
    });

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
});
