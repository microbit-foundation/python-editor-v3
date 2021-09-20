import { toByteArray } from "base64-js";

import { LZMA } from "lzma/src/lzma-d-min";

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

export const parseMigrationFromUrl = (url: string): Migration | undefined => {
  const urlPart = url.split("#project:")[1];
  try {
    if (urlPart) {
      const bytes = toByteArray(urlPart);
      const json = JSON.parse(LZMA.decompress(bytes));
      if (isMigration(json)) {
        return json;
      }
    }
  } catch (e) {
    // Ultimate source is from the URL so we need to be robust to tampering.
  }
  return undefined;
};
