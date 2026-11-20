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
export interface ProjectLink {
  meta: {
    name: string;
  };
  source: string;
}

export const isProjectLink = (v: any): v is ProjectLink =>
  !!v &&
  typeof v === "object" &&
  !!v.meta &&
  typeof v.meta === "object" &&
  typeof v.meta?.name === "string" &&
  typeof v.source === "string";

interface ProjectLinkParseResult {
  link: ProjectLink;
  urlWithoutLink: string;
}

/**
 * True if the URL carries a #project: link. On microbit.org links it sits
 * behind the v2 editor's #import: prefix, so it isn't always the whole hash.
 */
export const hasProjectLink = (url: string): boolean =>
  url.includes("#project:");

export const parseProjectLink = (
  url: string
): ProjectLinkParseResult | undefined => {
  const parts = url.split("#project:");
  const urlPart = parts[1];
  try {
    if (urlPart) {
      const bytes = toByteArray(urlPart);
      const json = JSON.parse(LZMA.decompress(bytes));
      if (isProjectLink(json)) {
        let urlWithoutLink = parts[0];
        // This was previously stripped off by the versioner but for now do it ourselves:
        urlWithoutLink = urlWithoutLink.replace(/#import:$/, "");
        return { link: json, urlWithoutLink };
      }
    }
  } catch {
    // Ultimate source is from the URL so we need to be robust to tampering.
  }
  return undefined;
};

/**
 * The #project: link the app booted with, if any, handed out once.
 *
 * With the projects database the link becomes a new project when the editor
 * chooses one; without it the host writes the program into the single
 * implicit project. Whichever runs first takes it. The taker also sees to
 * removing the hash from the URL, so a reload opens what is stored rather
 * than importing again.
 */
export class PendingProjectLink {
  private link: ProjectLink | undefined;

  constructor(url: string) {
    this.link = parseProjectLink(url)?.link;
  }

  get pending(): boolean {
    return this.link !== undefined;
  }

  take(): ProjectLink | undefined {
    const link = this.link;
    this.link = undefined;
    return link;
  }
}
