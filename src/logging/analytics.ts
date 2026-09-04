/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  ConnectionStatus,
  ConnectionStatusChange,
  DeviceError,
} from "@microbit/microbit-connection";
import { Logging } from "./logging";

/**
 * Shared vocabulary for the device_* events. See docs/analytics-events.md.
 *
 * `transport` describes the user's hardware setup. The editor only
 * connects over WebUSB, so it's a constant here; ml-trainer emits
 * `web_bluetooth` / `native_bluetooth` / `radio` for the same param.
 */
export const transport = "web_usb";

/**
 * Which user goal the device event belongs to: `connect` for the Connect
 * button (serial / REPL plus fast flashing) or `download` for Send to
 * micro:bit, including any connection it had to establish first.
 */
export type AnalyticsTask = "connect" | "download";

export type ImportFormat = "hex" | "py" | "other" | "multiple";

/**
 * The `format` param for project_import. Extension-based because the
 * event counts attempts and fires before the files are parsed.
 */
export const importFormat = (files: File[]): ImportFormat => {
  if (files.length > 1) {
    return "multiple";
  }
  const parts = files[0].name.toLowerCase().split(".");
  const extension = parts.length > 1 ? parts[parts.length - 1] : "";
  switch (extension) {
    case "hex":
      return "hex";
    case "py":
      return "py";
    default:
      return "other";
  }
};

/**
 * The `code` param for device_failure.
 */
export const deviceFailureCode = (e: unknown): string =>
  e instanceof DeviceError ? e.code : "unknown";

// Set by the user-initiated disconnect action so the status listener
// below doesn't also report the resulting status change as an
// unexpected disconnect.
let userDisconnectPending = false;

export const markUserDisconnect = (pending: boolean): void => {
  userDisconnectPending = pending;
};

/**
 * Emit device_disconnect with reason `unknown` when a connected device
 * goes away other than via the Disconnect button (unplugged, reset,
 * browser revoked access). Wire to the device's "status" event.
 */
export const logDeviceStatusChange = (
  logging: Logging,
  change: ConnectionStatusChange
): void => {
  if (change.previousStatus !== ConnectionStatus.Connected) {
    return;
  }
  if (
    change.status !== ConnectionStatus.Disconnected &&
    change.status !== ConnectionStatus.NoAuthorizedDevice
  ) {
    return;
  }
  const user = userDisconnectPending;
  userDisconnectPending = false;
  if (!user) {
    logging.event({
      type: "device_disconnect",
      detail: { reason: "unknown", transport },
    });
  }
};
