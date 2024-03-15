/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ConnectionStatus,
  DeviceConnection,
  EVENT_FLASH,
  EVENT_SERIAL_DATA,
  EVENT_STATUS,
  FlashDataSource,
  WebUSBError,
  WebUSBErrorCode,
} from "./device";
import EventEmitter from "events";

/**
 * A mock device used during end-to-end testing.
 *
 * No meaningful behaviour yet though we'll add some serial
 * interactions in future. The main aim is to get the UI into
 * the connected state without a real device.
 */
export class MockDeviceConnection
  extends EventEmitter
  implements DeviceConnection
{
  status: ConnectionStatus = navigator.usb
    ? ConnectionStatus.NO_AUTHORIZED_DEVICE
    : ConnectionStatus.NOT_SUPPORTED;

  private connectResults: WebUSBErrorCode[] = [];

  constructor() {
    super();
    // Make globally available to allow e2e tests to configure interactions.
    (window as any).mockDevice = this;
  }

  mockSerialWrite(data: string) {
    this.emit(EVENT_SERIAL_DATA, data);
  }

  mockConnect(code: WebUSBErrorCode) {
    this.connectResults.push(code);
  }

  async initialize(): Promise<void> {}

  dispose() {
    this.removeAllListeners();
  }

  async connect(): Promise<ConnectionStatus> {
    const next = this.connectResults.shift();
    if (next) {
      throw new WebUSBError({ code: next, message: "Mocked failure" });
    }

    this.setStatus(ConnectionStatus.CONNECTED);
    return this.status;
  }

  /**
   * Flash the micro:bit.
   *
   * @param dataSource The data to use.
   * @param options Flash options and progress callback.
   */
  async flash(
    _dataSource: FlashDataSource,
    options: {
      /**
       * True to use a partial flash where possible, false to force a full flash.
       */
      partial: boolean;
      /**
       * A progress callback. Called with undefined when the process is complete or has failed.
       */
      progress: (percentage: number | undefined) => void;
    }
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    options.progress(0.5);
    await new Promise((resolve) => setTimeout(resolve, 100));
    options.progress(undefined);
    this.emit(EVENT_FLASH);
  }

  async disconnect(): Promise<void> {
    this.setStatus(ConnectionStatus.NOT_CONNECTED);
  }

  async serialWrite(data: string): Promise<void> {
    console.log("[Serial] ", data);
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.emit(EVENT_STATUS, this.status);
  }

  clearDevice(): void {
    this.setStatus(ConnectionStatus.NO_AUTHORIZED_DEVICE);
  }

  mockWebUsbNotSupported(): void {
    this.setStatus(ConnectionStatus.NOT_SUPPORTED);
  }
}
