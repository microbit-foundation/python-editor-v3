/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntelHexWithId } from "@microbit/microbit-fs";
import { microbitBoardId } from "@microbit/microbit-universal-hex";
import microPythonV1HexUrl from "./microbit-micropython-v1.hex";
import microPythonV2HexUrl from "./microbit-micropython-v2.hex";

export const microPythonVersions = [
  {
    name: "MicroPython (micro:bit V1)",
    url: microPythonV1HexUrl,
    boardId: microbitBoardId.V1,
    version: "1.0.1",
  },
  {
    name: "MicroPython (micro:bit V2)",
    url: microPythonV2HexUrl,
    boardId: microbitBoardId.V2,
    version: "2.0.0-beta.4",
  },
];

const fetchValidText = async (input: RequestInfo) => {
  const response = await fetch(input);
  if (response.status !== 200) {
    throw new Error(
      `Unexpected status: ${response.statusText} ${response.status}`
    );
  }
  return response.text();
};

export type MicroPythonSource = () => Promise<IntelHexWithId[]>;

export const fetchMicroPython: MicroPythonSource = async () =>
  Promise.all(
    microPythonVersions.map(async ({ boardId, url }) => {
      const hex = await fetchValidText(url);
      return { boardId, hex };
    })
  );
