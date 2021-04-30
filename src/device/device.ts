import EventEmitter from "events";
import { Logging } from "../logging/logging";
import { NullLogging } from "../logging/null";
import translation from "../translation";
import { BoardId } from "./board-id";
import { DAPWrapper } from "./dap-wrapper";
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

interface MicrobitWebUSBConnectionOptions {
  // We should copy this type when extracting a library, and make it optional.
  // Coupling for now to make it easy to evolve.

  logging: Logging;
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

export class HexGenerationError extends Error {}

export interface FlashDataSource {
  /**
   * The data required for a partial flash.
   *
   * @param boardId the id of the board.
   * @throws HexGenerationError if we cannot generate hex data.
   */
  partialFlashData(boardId: BoardId): Promise<Uint8Array>;

  /**
   * A full hex.
   *
   * @param boardId
   * @throws HexGenerationError if we cannot generate hex.
   */
  fullFlashData(boardId: BoardId): Promise<Uint8Array>;
}

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

  /**
   * DAPLink gives us a promise that lasts as long as we're serial reading.
   * When stopping serial we await it to be sure we're done.
   */
  private serialReadInProgress: Promise<void> | undefined;

  private serialListener = (data: string) => {
    this.emit(EVENT_SERIAL_DATA, data);
  };

  private visibilityChangeListener = () => {
    console.log("Visibility change " + document.visibilityState);
    if (document.visibilityState === "visible") {
      // We could reconnect here if we'd previously disconnected.
    } else {
      if (!this.unloading) {
        this.disconnect();
      }
    }
  };

  private unloading = false;

  private beforeUnloadListener = () => {
    // Workaround https://github.com/microbit-foundation/python-editor-next/issues/89
    this.unloading = true;
    this.stopSerialInternal();
    // The user might stay on the page if they have unsaved changes and there's
    // another beforeunload listener. It's hard to tell that's what's happened!
    window.addEventListener(
      "focus",
      () => {
        const assumePageIsStayingOpenDelay = 1000;
        setTimeout(() => {
          if (this.status === ConnectionStatus.CONNECTED) {
            this.unloading = false;
            this.startSerialInternal();
          }
        }, assumePageIsStayingOpenDelay);
      },
      { once: true }
    );
  };

  private logging: Logging;

  constructor(
    options: MicrobitWebUSBConnectionOptions = { logging: new NullLogging() }
  ) {
    super();
    this.logging = options.logging;
  }

  private log(v: any) {
    this.logging.log(v);
  }

  async initialize(): Promise<void> {
    if (navigator.usb) {
      navigator.usb.addEventListener("disconnect", this.handleDisconnect);
    }
    if (window) {
      window.addEventListener("beforeunload", this.beforeUnloadListener);
    }
    if (window && window.document) {
      window.document.addEventListener(
        "visibilitychange",
        this.visibilityChangeListener
      );
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
    if (window) {
      window.removeEventListener("beforeunload", this.beforeUnloadListener);
    }
    if (window && window.document) {
      window.document.removeEventListener(
        "visibilitychange",
        this.visibilityChangeListener
      );
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
      this.log("Stopping serial before flash");
      await this.stopSerialInternal();
      this.log("Reconnecting before flash");
      await this.connection.reconnectAsync();
    }
    if (!this.connection) {
      throw new Error("Must be connected now");
    }

    const partial = options.partial;
    const progress = options.progress || (() => {});

    const boardIdString = this.connection.boardId;
    const boardId = BoardId.parse(boardIdString);
    const flashing = new PartialFlashing(this.connection, this.logging);
    try {
      if (partial) {
        await flashing.flashAsync(boardId, dataSource, progress);
      } else {
        await flashing.fullFlashAsync(boardId, dataSource, progress);
      }

      this.log("Reinstating serial after flash");
      await this.connection.daplink.connect();
      this.startSerialInternal();
      await this.connection.disconnectAsync();
    } finally {
      progress(undefined);
    }
  }

  private async startSerialInternal() {
    // This is async but won't return until we stop serial so we error handle with an event.
    if (!this.connection) {
      throw new Error("Must be connected now");
    }
    if (this.serialReadInProgress) {
      await this.stopSerialInternal();
    }
    this.serialReadInProgress = this.connection
      .startSerial(this.serialListener)
      .then(() => this.log("Finished listening for serial data"))
      .catch((e) => {
        this.emit(EVENT_SERIAL_ERROR, e);
      });
  }

  private async stopSerialInternal() {
    if (this.connection && this.serialReadInProgress) {
      this.connection.stopSerial(this.serialListener);
      await this.serialReadInProgress;
      this.serialReadInProgress = undefined;
    }
    this.emit(EVENT_SERIAL_RESET, {});
  }

  /**
   * Disconnect from the device.
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.stopSerialInternal();
        await this.connection.disconnectAsync();
      }
    } catch (e) {
      this.log("Error during disconnection:\r\n" + e);
    } finally {
      this.connection = undefined;
      this.setStatus(ConnectionStatus.NOT_CONNECTED);
    }
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.log("Device status " + newStatus);
    this.emit(EVENT_STATUS, this.status);
  }

  async withEnrichedErrors<T>(f: () => Promise<T>): Promise<T> {
    try {
      return await f();
    } catch (e) {
      // Log error to console for feedback
      this.log("An error occurred whilst attempting to use WebUSB.");
      this.log(
        "Details of the error can be found below, and may be useful when trying to replicate and debug the error."
      );
      this.log(e);

      // Disconnect from the microbit.
      // Any new connection reallocates all the internals.
      // Use the top-level API so any listeners reflect that we're disconnected.
      await this.disconnect();

      throw enrichedError(e);
    }
  }

  serialWrite(data: string): Promise<void> {
    return this.withEnrichedErrors(async () => {
      if (this.connection) {
        return this.connection.daplink.serialWrite(data);
      }
    });
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
      this.connection = new DAPWrapper(device, this.logging);
    }
    await this.connection.reconnectAsync();
    if (serial) {
      this.startSerialInternal();
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
      return genericErrorSuggestingReconnect(err);
    }
    default: {
      return genericErrorSuggestingReconnect(err);
    }
  }
};
