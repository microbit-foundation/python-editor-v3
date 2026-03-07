/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoardVersion,
  ConnectionAvailabilityStatus,
  ConnectionStatus,
  DeviceConnectionEventMap,
  FlashDataSource,
  FlashOptions,
  ProgressStage,
  DeviceError,
  DeviceErrorCode,
  TypedEventTarget,
} from "@microbit/microbit-connection";
import { SerialConnectionEventMap } from "@microbit/microbit-connection/usb";
import { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";

/**
 * A mock device used during end-to-end testing.
 *
 * No meaningful behaviour yet though we'll add some serial
 * interactions in future. The main aim is to get the UI into
 * the connected state without a real device.
 */
export class MockDeviceConnection
  extends TypedEventTarget<DeviceConnectionEventMap & SerialConnectionEventMap>
  implements MicrobitUSBConnection
{
  status: ConnectionStatus = ConnectionStatus.NoAuthorizedDevice;

  private connectResults: DeviceErrorCode[] = [];
  private availability: ConnectionAvailabilityStatus = "available";

  constructor() {
    super();
    // Make globally available to allow e2e tests to configure interactions.
    (window as any).mockDevice = this;
  }

  mockSerialWrite(data: string) {
    this.dispatchEvent("serialdata", { data });
  }

  mockConnect(code: DeviceErrorCode) {
    this.connectResults.push(code);
  }

  async initialize(): Promise<void> {}
  async checkAvailability() {
    return this.availability;
  }

  dispose() {}
  getDeviceId(): number {
    return 0;
  }
  setRequestDeviceExclusionFilters(): void {}
  getDevice() {
    return undefined;
  }
  async softwareReset(): Promise<void> {}

  async connect(): Promise<void> {
    const next = this.connectResults.shift();
    if (next) {
      throw new DeviceError({ code: next, message: "Mocked failure" });
    }

    this.setStatus(ConnectionStatus.Connected);
  }

  getBoardVersion(): BoardVersion {
    return "V2";
  }

  /**
   * Flash the micro:bit.
   *
   * @param dataSource The data to use.
   * @param options Flash options and progress callback.
   */
  async flash(
    _dataSource: FlashDataSource,
    options: FlashOptions
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    options.progress?.(ProgressStage.PartialFlashing, 0.5);
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.dispatchEvent("flash");
  }

  async disconnect(): Promise<void> {
    this.setStatus(ConnectionStatus.Disconnected);
  }

  async serialWrite(data: string): Promise<void> {
    console.log("[Serial] ", data);
  }

  private setStatus(newStatus: ConnectionStatus) {
    const previousStatus = this.status;
    this.status = newStatus;
    this.dispatchEvent("status", {
      status: newStatus,
      previousStatus,
    });
  }

  clearDevice(): void {
    this.setStatus(ConnectionStatus.NoAuthorizedDevice);
  }

  mockWebUsbNotSupported(): void {
    this.availability = "unsupported";
  }
}
