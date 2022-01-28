/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { PortableText } from "../../common/sanity";

const defaults = { nonTextBehavior: "remove" };

export const blocksToText = (
  blocks: PortableText | undefined,
  opts = {}
): string => {
  const options = Object.assign({}, defaults, opts);
  if (!blocks) {
    return "";
  }
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return options.nonTextBehavior === "remove"
          ? ""
          : `[${block._type} block]`;
      }

      return block.children.map((child: any): string => child.text).join("");
    })
    .join("\n\n");
};
