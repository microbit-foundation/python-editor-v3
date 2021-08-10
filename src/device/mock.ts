import {
  ConnectionStatus,
  DeviceConnection,
  EVENT_STATUS,
  FlashDataSource,
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

  async initialize(): Promise<void> {}

  dispose() {
    this.removeAllListeners();
  }

  async connect(): Promise<ConnectionStatus> {
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
    dataSource: FlashDataSource,
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
  }

  async disconnect(): Promise<void> {
    this.setStatus(ConnectionStatus.NOT_CONNECTED);
  }

  async serialWrite(data: string): Promise<void> {
    // Can we use Puppeteer
    console.log("[Serial] ", data);
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.emit(EVENT_STATUS, this.status);
  }
}
