/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoardId } from "./board-id";
import { BoardSerialInfo } from "./board-serial-info";
import { vi } from "vitest";

describe("BoardSerialInfo", () => {
  const valid = {
    serialNumber: "9904360251974e450039900a00000041000000009796990b",
  } as USBDevice;
  const weirdLength = {
    serialNumber: "9904360251974e450039900a000000410000000097969",
  } as USBDevice;
  const missing = { serialNumber: "" } as USBDevice;
  const log = vi.fn();
  afterEach(() => {
    log.mockReset();
  });

  it("throws if serialNumber missing", () => {
    expect(() => BoardSerialInfo.parse(missing, log)).toThrowError();

    expect(log.mock.calls).toEqual([]);
  });

  it("parses serials", () => {
    const result = BoardSerialInfo.parse(valid, log);
    expect(result).toEqual({
      id: BoardId.parse("9904"),
      familyId: "3602",
      hic: "9796990b",
    });

    expect(log.mock.calls).toEqual([]);
  });

  it("logs if unexpected length", () => {
    const result = BoardSerialInfo.parse(weirdLength, log);
    expect(result).toEqual({
      id: BoardId.parse("9904"),
      familyId: "3602",
      hic: "00097969",
    });

    expect(log.mock.calls).toEqual([
      ["USB serial number unexpected length: 45"],
    ]);
  });
});
