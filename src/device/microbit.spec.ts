import { ConnectionStatus, MicrobitWebUSBConnection } from "./microbit";

describe(`MicrobitWebUSBConnection`, () => {
  it(`should have correct initial state`, () => {
    const microbit = new MicrobitWebUSBConnection();
    expect(microbit.status).toBe(ConnectionStatus.NOT_SUPPORTED);
  });
});
