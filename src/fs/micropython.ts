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
    web: "https://github.com/bbcmicrobit/micropython/releases/tag/v1.0.1",
  },
  {
    name: "MicroPython (micro:bit V2)",
    url: microPythonV2HexUrl,
    boardId: microbitBoardId.V2,
    // Temporary pre-release version for data logging testing
    // Commit 569e36181a3bf63d28f439527847502e3361ace1 (master)
    version: "569e361",
    web: "https://github.com/microbit-foundation/micropython-microbit-v2/actions/runs/2372009656",
    // When we're back on a release we want URLs in this format:
    // web: "https://github.com/microbit-foundation/micropython-microbit-v2/releases/tag/v2.0.0",
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
