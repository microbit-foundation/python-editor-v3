/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export const lineNumFromUint8Array = (arr: Uint8Array): number => {
  let lineCount = 1;
  let prevByte: number | undefined;
  const LF = 10;
  const CR = 13;
  arr.forEach((byte) => {
    if ((byte === LF && prevByte !== CR) || byte === CR) {
      lineCount++;
    }
    prevByte = byte;
  });
  return lineCount;
};
