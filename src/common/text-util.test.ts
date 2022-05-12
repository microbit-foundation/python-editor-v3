/**
 * @jest-environment node
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { lineNumFromUint8Array } from "./text-util";

describe("lineNumFromUint8Array", () => {
  it("correctly counts lines from Uint8Arrays with a mixture of CR and LF line endings", () => {
    const textEncoder = new TextEncoder();
    const newLinesAsLF = textEncoder.encode(
      "# testcase\n\nwhile True:\n\tdisplay.scroll('micro:bit')\n\tdisplay.show(Image.HEART)\n\tsleep(2000)"
    );
    expect(lineNumFromUint8Array(newLinesAsLF)).toBe(6);
    const newLinesAsCR = textEncoder.encode(
      "# testcase\r\rwhile True:\r\tdisplay.scroll('micro:bit')\r\tdisplay.show(Image.HEART)\r\tsleep(2000)"
    );
    expect(lineNumFromUint8Array(newLinesAsCR)).toBe(6);
    const newLinesAsCRLF = textEncoder.encode(
      "# testcase\r\n\r\nwhile True:\r\n\tdisplay.scroll('micro:bit')\r\n\tdisplay.show(Image.HEART)\r\n\tsleep(2000)"
    );
    expect(lineNumFromUint8Array(newLinesAsCRLF)).toBe(6);
  });
});
