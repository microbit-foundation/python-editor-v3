/**
 * @jest-environment node
 *
 * Without node environment USB code fails with a buffer type check.
 * It might be we could create a custom environment that was web but
 * with a tweak to Buffer.
 */
import { ConnectionStatus, MicrobitWebUSBConnection } from "./device";
import { USB } from "webusb";

const describeDeviceOnly = process.env.TEST_MODE_DEVICE
  ? describe
  : describe.skip;

describe("MicrobitWebUSBConnection (no WebUSB)", () => {
  it(`notices if WebUSB isn't supported`, () => {
    (global as any).navigator = {};
    const microbit = new MicrobitWebUSBConnection();
    expect(microbit.status).toBe(ConnectionStatus.NOT_SUPPORTED);
  });
});

describeDeviceOnly("MicrobitWebUSBConnection", () => {
  beforeAll(() => {
    // Maybe we can move this to a custom jest environment?
    (global as any).navigator = {
      usb: new USB({}),
    };
  });

  it(`should have correct initial state`, () => {
    const microbit = new MicrobitWebUSBConnection();
    expect(microbit.status).toBe(ConnectionStatus.NO_AUTHORIZED_DEVICE);
  });
  it("connects", async () => {
    const connection = new MicrobitWebUSBConnection();
    await connection.connect();
    // without this it breaks! something is up!
    await new Promise((resolve) => setTimeout(resolve, 100));
    await connection.disconnect();
  });
});
