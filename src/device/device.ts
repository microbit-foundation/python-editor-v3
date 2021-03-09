import EventEmitter from "events";
import { FlashDataSource } from "../fs/fs";
import translation from "../translation";
import { BoardId } from "./board-id";
import { DAPWrapper } from "./dap-wrapper";
import { log } from "./logging";
import { PartialFlashing } from "./partial-flashing";

/**
 * Specific identified error types.
 *
 * New members may be added over time.
 */
export type WebUSBErrorCode =
  /**
   * Device not found, perhaps because it doesn't have new enough firmware (for V1).
   */
  | "update-req"
  /**
   * Unable to claim the interface, usually because it's in use in another tab/window.
   */
  | "clear-connect"
  /**
   * The device was found to be disconnected.
   */
  | "device-disconnected"
  /**
   * A communication timeout occurred.
   */
  | "timeout-error"
  /**
   * This is the fallback error case suggesting that the user reconnects their device.
   */
  | "reconnect-microbit";

/**
 * Error type used for all interactions with this module.
 */
export class WebUSBError extends Error {
  code: WebUSBErrorCode;
  title: string;
  description?: string;
  constructor({
    code,
    title,
    message,
    description,
  }: {
    code: WebUSBErrorCode;
    title: string;
    message?: string;
    description?: string;
  }) {
    super(message);
    this.code = code;
    this.title = title;
    this.description = description;
  }
}

/**
 * Tracks WebUSB connection status.
 */
export enum ConnectionStatus {
  /**
   * Not supported.
   */
  NOT_SUPPORTED = "NOT_SUPPORTED",
  /**
   * Supported but no device available.
   *
   * This will be the case even when a device is physically connected
   * but has not been connected via the browser security UI.
   */
  NO_AUTHORIZED_DEVICE = "NO_DEVICE",
  /**
   * Authorized device available but we haven't connected to it.
   */
  NOT_CONNECTED = "NOT_CONNECTED",
  /**
   * Connected.
   */
  CONNECTED = "CONNECTED",
}

export const EVENT_STATUS = "status";
export const EVENT_SERIAL_DATA = "serial_data";
export const EVENT_SERIAL_RESET = "serial_reset";
export const EVENT_SERIAL_ERROR = "serial_error";

/**
 * A WebUSB connection to a micro:bit device.
 */
export class MicrobitWebUSBConnection extends EventEmitter {
  status: ConnectionStatus = navigator.usb
    ? ConnectionStatus.NO_AUTHORIZED_DEVICE
    : ConnectionStatus.NOT_SUPPORTED;

  /**
   * The USB device we last connected to.
   * Cleared if it is disconnected.
   */
  private device: USBDevice | undefined;
  /**
   * The connection to the device.
   */
  private connection: DAPWrapper | undefined;

  private serialListener = (data: string) => {
    this.emit(EVENT_SERIAL_DATA, data);
  };

  async initialize(): Promise<void> {
    if (navigator.usb) {
      navigator.usb.addEventListener("disconnect", this.handleDisconnect);
    }
  }

  /**
   * Removes all listeners.
   */
  dispose() {
    this.removeAllListeners();
    if (navigator.usb) {
      navigator.usb.removeEventListener("disconnect", this.handleDisconnect);
    }
  }

  /**
   * Connects to a currently paired device or requests pairing.
   * Throws on error.
   *
   * @param interactive whether we can prompt the user to choose a device.
   * @returns the final connection status.
   */
  async connect(): Promise<ConnectionStatus> {
    return this.withEnrichedErrors(async () => {
      await this.connectInternal(true);
      return this.status;
    });
  }

  async flash(
    dataSource: FlashDataSource,
    options: {
      partial: boolean;
      progress: (percentage: number | undefined) => void;
    }
  ): Promise<void> {
    return this.withEnrichedErrors(() =>
      this.flashInternal(dataSource, options)
    );
  }

  private async stopSerial() {
    if (this.connection) {
      this.connection.stopSerial(this.serialListener);
    }
    this.emit(EVENT_SERIAL_RESET, {});
  }

  private async flashInternal(
    dataSource: FlashDataSource,
    options: {
      partial: boolean;
      progress: (percentage: number | undefined) => void;
    }
  ): Promise<void> {
    if (!this.connection) {
      await this.connectInternal(false);
    } else {
      log("Stopping serial before flash");
      this.stopSerial();
      log("Reconnecting before flash");
      await this.connection.reconnectAsync();
    }
    if (!this.connection) {
      throw new Error("Must be connected now");
    }

    const partial = options.partial;
    const progress = options.progress || (() => {});

    const boardIdString = this.connection.boardId;
    const boardId = BoardId.parse(boardIdString);
    const data = await dataSource(boardId);
    const flashing = new PartialFlashing(this.connection);
    try {
      if (partial) {
        await flashing.flashAsync(data.bytes, data.intelHex, progress);
      } else {
        await flashing.fullFlashAsync(data.intelHex, progress);
      }

      // Can we avoid doing this? Is there a chance we miss program output?
      log("Reinstating serial after flash");
      await this.connection.reconnectAsync();

      // This is async but won't return until we've finished serial.
      // TODO: consider error handling here.
      this.connection
        .startSerial(this.serialListener)
        .then(() => log("Finished listening for serial data"));
    } finally {
      progress(undefined);
    }
  }

  /**
   * Disconnect from the device.
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        this.stopSerial();
        this.connection.disconnectAsync();
      }
    } catch (e) {
      log("Error during disconnection:\r\n" + e);
    } finally {
      this.connection = undefined;
      this.setStatus(ConnectionStatus.NOT_CONNECTED);
    }
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    log("Device status " + newStatus);
    this.emit(EVENT_STATUS, this.status);
  }

  async withEnrichedErrors<T>(f: () => Promise<T>): Promise<T> {
    try {
      return await f();
    } catch (e) {
      // Log error to console for feedback
      log("An error occurred whilst attempting to use WebUSB.");
      log(
        "Details of the error can be found below, and may be useful when trying to replicate and debug the error."
      );
      log(e);

      // Disconnect from the microbit.
      // Any new connection reallocates all the internals.
      // Use the top-level API so any listeners reflect that we're disconnected.
      await this.disconnect();

      throw enrichedError(e);
    }
  }

  serialWrite(data: string): void {
    if (this.connection) {
      try {
        this.connection.daplink.serialWrite(data);
      } catch (e) {
        console.log("Serial write error");
        console.error(e);
      }
    }
  }

  private handleDisconnect = (event: USBConnectionEvent) => {
    if (event.device === this.device) {
      this.connection = undefined;
      this.device = undefined;
      this.setStatus(ConnectionStatus.NO_AUTHORIZED_DEVICE);
    }
  };

  private async connectInternal(serial: boolean): Promise<void> {
    if (!this.connection) {
      const device = await this.chooseDevice();
      this.connection = new DAPWrapper(device);
    }
    await this.connection.reconnectAsync();
    if (serial) {
      this.connection.startSerial(this.serialListener);
    }
    this.setStatus(ConnectionStatus.CONNECTED);
  }

  private async chooseDevice(): Promise<USBDevice> {
    if (this.device) {
      return this.device;
    }
    this.device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x0d28, productId: 0x0204 }],
    });
    return this.device;
  }
}

const genericErrorSuggestingReconnect = (e: any) =>
  new WebUSBError({
    code: "reconnect-microbit",
    title: "WebUSB Error",
    description: translation["webusb"]["err"]["reconnect-microbit"],
    message: e.message,
  });

// tslint:disable-next-line: no-any
const enrichedError = (err: any): WebUSBError => {
  if (err instanceof WebUSBError) {
    return err;
  }
  switch (typeof err) {
    case "object":
      log("Caught in Promise or Error object");
      // We might get Error objects as Promise rejection arguments
      if (!err.message && err.promise && err.reason) {
        err = err.reason;
      }

      if (err.message === "No valid interfaces found.") {
        return new WebUSBError({
          title: translation["webusb"]["err"]["update-req-title"],
          code: "update-req",
          description: translation["webusb"]["err"]["update-req"],
        });
      } else if (err.message === "Unable to claim interface.") {
        return new WebUSBError({
          code: "clear-connect",
          title: err.message,
          description: translation["webusb"]["err"]["clear-connect"],
        });
      } else if (err.name === "device-disconnected") {
        return new WebUSBError({
          code: "device-disconnected",
          title: err.message,
          // No additional message provided here, err.message is enough
        });
      } else if (err.name === "timeout-error") {
        return new WebUSBError({
          code: "timeout-error",
          title: "Connection Timed Out",
          description: translation["webusb"]["err"]["reconnect-microbit"],
        });
      } else {
        // Unhandled error. User will need to reconnect their micro:bit
        return genericErrorSuggestingReconnect(err);
      }
    case "string": {
      // Caught a string. Example case: "Flash error" from DAPjs
      log("Caught a string");
      return genericErrorSuggestingReconnect(err);
    }
    default: {
      log("Unexpected error type: " + typeof err);
      return genericErrorSuggestingReconnect(err);
    }
  }
};
