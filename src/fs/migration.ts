/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { toByteArray } from "base64-js";

import lzma from "lzma/src/lzma-d";

// LZMA isn't a proper module.
// When bundled it assigns to window. At dev time it works via the above import.
const LZMA =
  typeof window !== "undefined" && (window as any).LZMA
    ? (window as any).LZMA
    : lzma.LZMA;

// There are other fields that we don't use.
export interface Migration {
  meta: {
    name: string;
  };
  source: string;
}

export const isMigration = (v: any): v is Migration =>
  !!v &&
  typeof v === "object" &&
  !!v.meta &&
  typeof v.meta === "object" &&
  typeof v.meta?.name === "string" &&
  typeof v.source === "string";

interface MigrationParseResult {
  migration: Migration;
  postMigrationUrl: string;
}

export const parseMigrationFromUrl = (
  url: string
): MigrationParseResult | undefined => {
  const parts = url.split("#project:");
  const urlPart = parts[1];
  try {
    if (urlPart) {
      const bytes = toByteArray(urlPart);
      const json = JSON.parse(LZMA.decompress(bytes));
      if (isMigration(json)) {
        let postMigrationUrl = parts[0];
        // This was previously stripped off by the versioner but for now do it ourselves:
        postMigrationUrl = postMigrationUrl.replace(/#import:$/, "");
        return { migration: json, postMigrationUrl };
      }
    }
  } catch (e) {
    // Ultimate source is from the URL so we need to be robust to tampering.
  }
  return undefined;
};
