/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntelHexWithId } from "@microbit/microbit-fs";
import { microbitBoardId } from "@microbit/microbit-universal-hex";
import microPythonV1HexUrl from "./microbit-micropython-v1.hex";
import microPythonV2HexUrl from "./main/microbit-micropython-v2.hex";
import microPythonV2BetaHexUrl from "./beta/microbit-micropython-v2.hex";
import { stage } from "../environment";

const v2Main = {
  name: "MicroPython (micro:bit V2)",
  url: microPythonV2HexUrl,
  boardId: microbitBoardId.V2,
  version: "2.1.2",
  web: "https://github.com/microbit-foundation/micropython-microbit-v2/releases/tag/v2.1.2",
};

// This isn't the beta yet - we're using a branch build temporarily.
const v2Beta = {
  name: "MicroPython (micro:bit V2)",
  url: microPythonV2BetaHexUrl,
  boardId: microbitBoardId.V2,
  version: "87f726cec9feeffcaee6e953d85fea14b28c404f",
  // It's not the beta yet!
  web: "https://github.com/microbit-foundation/micropython-microbit-v2/pull/163",
};

const isBetaMicroPython = stage !== "PRODUCTION";

export const microPythonConfig = {
  versions: [
    {
      name: "MicroPython (micro:bit V1)",
      url: microPythonV1HexUrl,
      boardId: microbitBoardId.V1,
      version: "1.1.1",
      web: "https://github.com/bbcmicrobit/micropython/releases/tag/v1.1.1",
    },
    isBetaMicroPython ? v2Beta : v2Main,
  ],
  // We've previously used this field to allow flags to affect
  // the stubs used and might do so again.
  stubs: isBetaMicroPython ? "beta" : "main",
};

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
    microPythonConfig.versions.map(async ({ boardId, url }) => {
      const hex = await fetchValidText(url);
      return { boardId, hex };
    })
  );
