/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ConnectionStatus, DeviceError } from "@microbit/microbit-connection";
import { beforeEach, describe, expect, it } from "vitest";
import {
  deviceFailureCode,
  importFormat,
  logDeviceStatusChange,
  markUserDisconnect,
} from "./analytics";
import { MockLogging } from "./mock";

const file = (name: string) => new File([""], name);

describe("importFormat", () => {
  it("classifies by extension, case-insensitively", () => {
    expect(importFormat([file("a.hex")])).toEqual("hex");
    expect(importFormat([file("A.HEX")])).toEqual("hex");
    expect(importFormat([file("main.py")])).toEqual("py");
    expect(importFormat([file("data.csv")])).toEqual("other");
    expect(importFormat([file("noextension")])).toEqual("other");
  });

  it("reports multiple files regardless of type", () => {
    expect(importFormat([file("a.py"), file("b.py")])).toEqual("multiple");
  });
});

describe("deviceFailureCode", () => {
  it("uses the DeviceError code", () => {
    expect(
      deviceFailureCode(new DeviceError({ code: "device-in-use" }))
    ).toEqual("device-in-use");
  });

  it("falls back to unknown for other errors", () => {
    expect(deviceFailureCode(new Error("boom"))).toEqual("unknown");
    expect(deviceFailureCode(undefined)).toEqual("unknown");
  });
});

describe("logDeviceStatusChange", () => {
  let logging: MockLogging;
  beforeEach(() => {
    logging = new MockLogging();
    markUserDisconnect(false);
  });

  it("reports an unexpected drop from Connected", () => {
    logDeviceStatusChange(logging, {
      previousStatus: ConnectionStatus.Connected,
      status: ConnectionStatus.Disconnected,
    });
    expect(logging.events).toEqual([
      {
        type: "device_disconnect",
        detail: { reason: "unknown", transport: "web_usb" },
      },
    ]);
  });

  it("treats loss of authorization from Connected as a drop", () => {
    logDeviceStatusChange(logging, {
      previousStatus: ConnectionStatus.Connected,
      status: ConnectionStatus.NoAuthorizedDevice,
    });
    expect(logging.events).toHaveLength(1);
  });

  it("ignores transitions that are not from Connected", () => {
    logDeviceStatusChange(logging, {
      previousStatus: ConnectionStatus.Connecting,
      status: ConnectionStatus.Disconnected,
    });
    logDeviceStatusChange(logging, {
      previousStatus: ConnectionStatus.Connected,
      status: ConnectionStatus.Paused,
    });
    expect(logging.events).toEqual([]);
  });

  it("suppresses the status change that follows a user disconnect, once", () => {
    markUserDisconnect(true);
    logDeviceStatusChange(logging, {
      previousStatus: ConnectionStatus.Connected,
      status: ConnectionStatus.Disconnected,
    });
    expect(logging.events).toEqual([]);
    logDeviceStatusChange(logging, {
      previousStatus: ConnectionStatus.Connected,
      status: ConnectionStatus.Disconnected,
    });
    expect(logging.events).toHaveLength(1);
  });
});
