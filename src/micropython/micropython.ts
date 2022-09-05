/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IntelHexWithId } from "@microbit/microbit-fs";
import { microbitBoardId } from "@microbit/microbit-universal-hex";
import { flags } from "../flags";
import microPythonV1HexUrl from "./microbit-micropython-v1.hex";
import microPythonV2HexUrl from "./main/microbit-micropython-v2.hex";
import microPythonV2AudioSoundEffectHexUrl from "./audio-sound-effect/microbit-micropython-v2.hex";

const v2Main = {
  name: "MicroPython (micro:bit V2)",
  url: microPythonV2HexUrl,
  boardId: microbitBoardId.V2,
  version: "2.1.0-beta.1",
  web: "https://github.com/microbit-foundation/micropython-microbit-v2/releases/tag/v2.1.0-beta.1",
};

const v2AudioSoundEffectsPreview = {
  name: "MicroPython (micro:bit V2)",
  url: microPythonV2AudioSoundEffectHexUrl,
  boardId: microbitBoardId.V2,
  // Temporary pre-release version for sound effects testing.
  // Commit 381972b77c2555870aecd7d8dbb8b0fe5c7e9a9e (audio-sound-effects)
  version: "381972b",
  web: "https://github.com/microbit-foundation/micropython-microbit-v2/actions/runs/2646530830",
};

export const microPythonConfig = {
  versions: [
    {
      name: "MicroPython (micro:bit V1)",
      url: microPythonV1HexUrl,
      boardId: microbitBoardId.V1,
      version: "1.1.0-beta.1",
      web: "https://github.com/bbcmicrobit/micropython/releases/tag/v1.1.0-beta.1",
    },
    flags.audioSoundEffect ? v2AudioSoundEffectsPreview : v2Main,
  ],
  stubs: flags.audioSoundEffect ? "audio-sound-effect" : "main",
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
