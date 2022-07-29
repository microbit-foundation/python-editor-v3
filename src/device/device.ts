/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import EventEmitter from "events";
import { Logging } from "../logging/logging";
import { BoardId } from "./board-id";

/**
 * Specific identified error types.
 *
 * New members may be added over time.
 */
export type WebUSBErrorCode =
  /**
   * Device not selected, e.g. because the user cancelled the dialog.
   */
  | "no-device-selected"
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
 *
 * The code indicates the error type and may be suitable for providing
 * translated error messages.
 *
 * The message is the underlying message text and will usually be in
 * English.
 */
export class WebUSBError extends Error {
  code: WebUSBErrorCode;
  constructor({ code, message }: { code: WebUSBErrorCode; message?: string }) {
    super(message);
    this.code = code;
  }
}

export interface MicrobitWebUSBConnectionOptions {
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

/**
 * Tracks user connection action.
 */
export enum ConnectionAction {
  FLASH = "FLASH",
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
}

export const EVENT_STATUS = "status";
export const EVENT_SERIAL_DATA = "serial_data";
export const EVENT_SERIAL_RESET = "serial_reset";
export const EVENT_SERIAL_ERROR = "serial_error";
export const EVENT_FLASH = "flash";
export const EVENT_START_USB_SELECT = "start_usb_select";
export const EVENT_END_USB_SELECT = "end_usb_select";

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
   * @param boardId the id of the board.
   * @throws HexGenerationError if we cannot generate hex data.
   */
  fullFlashData(boardId: BoardId): Promise<Uint8Array>;

  /**
   * The file system represented by file name keys and data values.
   */
  files(): Promise<Record<string, Uint8Array>>;
}

export interface ConnectOptions {
  serial?: boolean;
}

export interface DeviceConnection extends EventEmitter {
  status: ConnectionStatus;

  /**
   * Initializes the device.
   */
  initialize(): Promise<void>;
  /**
   * Removes all listeners.
   */
  dispose(): void;

  /**
   * Connects to a currently paired device or requests pairing.
   * Throws on error.
   *
   * @returns the final connection status.
   */
  connect(options?: ConnectOptions): Promise<ConnectionStatus>;

  /**
   * Flash the micro:bit.
   *
   * @param dataSource The data to use.
   * @param options Flash options and progress callback.
   */
  flash(
    dataSource: FlashDataSource,
    options: {
      /**
       * True to use a partial flash where possible, false to force a full flash.
       */
      partial: boolean;
      /**
       * A progress callback. Called with undefined when the process is complete or has failed.
       *
       * Requesting a partial flash doesn't guarantee one is performed. Partial flashes are avoided
       * if too many blocks have changed and failed partial flashes are retried as full flashes.
       * The partial parameter reports the flash type currently in progress.
       */
      progress: (percentage: number | undefined, partial: boolean) => void;
    }
  ): Promise<void>;

  /**
   * Disconnect from the device.
   */
  disconnect(): Promise<void>;

  /**
   * Write serial data to the device.
   *
   * Does nothting if there is no connection.
   *
   * @param data The data to write.
   * @returns A promise that resolves when the write is complete.
   */
  serialWrite(data: string): Promise<void>;

  /**
   * Clear device to enable chooseDevice.
   */
  clearDevice(): void;
}
