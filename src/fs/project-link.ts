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

/**
 * What a URL has by way of a #project: link: none, one, or something after
 * the marker that cannot be read as one.
 */
export type ProjectLinkResult =
  | { status: "none" }
  | { status: "ok"; link: ProjectLink }
  | { status: "unreadable" };

/**
 * Reads the #project: link in a URL. On microbit.org links it sits behind
 * the v2 editor's #import: prefix, so it isn't always the whole hash.
 */
export const parseProjectLink = (url: string): ProjectLinkResult => {
  const encoded = url.split("#project:")[1];
  if (encoded === undefined) {
    return { status: "none" };
  }
  try {
    const json = JSON.parse(LZMA.decompress(toByteArray(encoded)));
    if (isProjectLink(json)) {
      return { status: "ok", link: json };
    }
  } catch {
    // Ultimate source is from the URL so we need to be robust to tampering.
  }
  return { status: "unreadable" };
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
  constructor(private link?: ProjectLink) {}

  get pending(): boolean {
    return this.link !== undefined;
  }

  take(): ProjectLink | undefined {
    const link = this.link;
    this.link = undefined;
    return link;
  }
}
