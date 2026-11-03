/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { PortableText } from "../../common/sanity";
import { Idea } from "./model";

const isCode = (
  block: PortableText[number]
): block is { _type: "python"; main: string } => block._type === "python";

/** The idea's program: its content's first code block. */
export const ideaCode = (idea: Idea): string | undefined =>
  idea.content?.find(isCode)?.main;

/** The idea's content without its code, for showing beside the code. */
export const withoutCode = (content: PortableText | undefined): PortableText =>
  (content ?? []).filter((block) => !isCode(block));
