/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { toByteArray } from "base64-js";

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
      const json = JSON.parse(
        // FIXME, reinstate decompression with a working module.
        /*LZMA.decompress(*/ new TextDecoder().decode(bytes) /*)*/
      );
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
