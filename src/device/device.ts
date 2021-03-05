import EventEmitter from "events";
import { FlashDataSource } from "../fs/fs";
import translation from "../translation";
import { BoardId } from "./board-id";
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

/**
 * Controls whether a request to connect can prompt the user.
 */
export enum ConnectionMode {
  /**
   * Prompt the user to connect if required.
   */
  INTERACTIVE,
  /**
   * Connect only to a pre-approved device without prompting the user.
   */
  NON_INTERACTIVE,
}

export interface MicrobitConnectionOptions {}

export const EVENT_STATUS = "status";
export const EVENT_SERIAL_DATA = "serial_data";
export const EVENT_SERIAL_ERROR = "serial_error";
export const EVENT_AUTOCONNECT_ERROR = "autoconnect_error";
export const EVENT_PROGRESS = "progress";

/**
 * A WebUSB connection to a micro:bit device.
 */
export class MicrobitWebUSBConnection extends EventEmitter {
  status: ConnectionStatus = navigator.usb
    ? ConnectionStatus.NO_AUTHORIZED_DEVICE
    : ConnectionStatus.NOT_SUPPORTED;

  private connection: PartialFlashing = new PartialFlashing();
  private options: MicrobitConnectionOptions;

  constructor(options: Partial<MicrobitConnectionOptions> = {}) {
    super();
    this.options = options;
  }

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
  async connect(mode: ConnectionMode): Promise<ConnectionStatus> {
    return this.withEnrichedErrors(async () => {
      this.setStatus(await this.connectInternal(mode));
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
    const partial = options.partial;
    const progress = options.progress || (() => {});

    // When we support it:
    // this.stopSerialRead();

    // Things to reinstate:
    //   - Metric/error reporting -- though check intentions, as it can lie
    //     about the type of flash performed

    // Shouldn't this timeout logic apply to (re)connection in general?
    // If so, we should push it down.
    const reconnectPromise = (async () => {
      await this.connection.disconnectDapAsync();
      await this.connection.connectDapAsync();
    })();
    const timeout = new Promise((resolve) =>
      setTimeout(() => resolve("timeout"), 10 * 1000)
    );
    const result = await Promise.race([reconnectPromise, timeout]);
    if (result === "timeout") {
      throw new WebUSBError({
        code: "timeout-error",
        title: "Connection Timed Out",
        description: translation["webusb"]["err"]["reconnect-microbit"],
      });
    }

    // Collect data to flash, partial flashing can use just the flash bytes,
    // but full flashing needs the entire Intel Hex to include the UICR data
    const boardId = BoardId.parse(this.connection.dapwrapper.boardId);
    const data = await dataSource(boardId);
    try {
      if (partial) {
        await this.connection.flashAsync(data.bytes, data.intelHex, progress);
      } else {
        await this.connection.fullFlashAsync(data.intelHex, progress);
      }
    } finally {
      progress(undefined);
    }
  }

  /**
   * Disconnect from the device.
   */
  async disconnect(): Promise<void> {
    try {
      await this.connection.disconnectDapAsync();
    } catch (e) {
      console.log("Error during disconnection:\r\n" + e);
      console.trace();
    } finally {
      // This seems a little dubious.
      console.log("Disconnection Complete");
    }
    this.setStatus(ConnectionStatus.NOT_CONNECTED);
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.emit(EVENT_STATUS, this.status);
  }

  async withEnrichedErrors<T>(f: () => Promise<T>): Promise<T> {
    try {
      return await f();
    } catch (e) {
      // Log error to console for feedback
      console.log("An error occurred whilst attempting to use WebUSB.");
      console.log(
        "Details of the error can be found below, and may be useful when trying to replicate and debug the error."
      );
      console.log(e);
      console.trace();

      // Disconnect from the microbit
      // As there has been an error clear the partial flashing DAPWrapper
      await this.disconnect();
      this.connection.resetInternals();

      throw enrichedError(e);
    }
  }

  private handleDisconnect = (event: USBConnectionEvent) => {
    // v2 uses this to show a dialog on disconnect.
    // it removes the listener when performing an intentional disconnect
    if (event.device === this.connection.dapwrapper?.daplink?.device) {
      this.setStatus(ConnectionStatus.NO_AUTHORIZED_DEVICE);
    }
  };

  private async connectInternal(
    mode: ConnectionMode
  ): Promise<ConnectionStatus> {
    // TODO: re-link what's going on to the connection status.
    await this.connection.connectDapAsync();
    return ConnectionStatus.CONNECTED;
  }
}

const genericErrorSuggestingReconnect = () =>
  new WebUSBError({
    code: "reconnect-microbit",
    title: "WebUSB Error",
    description: translation["webusb"]["err"]["reconnect-microbit"],
  });

// tslint:disable-next-line: no-any
const enrichedError = (err: any): WebUSBError => {
  if (err instanceof WebUSBError) {
    return err;
  }
  switch (typeof err) {
    case "object":
      console.log("Caught in Promise or Error object");
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
        return genericErrorSuggestingReconnect();
      }
    case "string": {
      // Caught a string. Example case: "Flash error" from DAPjs
      console.log("Caught a string");
      return genericErrorSuggestingReconnect();
    }
    default: {
      console.log("Unexpected error type: " + typeof err);
      return genericErrorSuggestingReconnect();
    }
  }
};
