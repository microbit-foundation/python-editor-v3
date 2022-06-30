/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { PortableText } from "../../common/sanity";
import { DocumentationCollapseMode } from "./DocumentationContent";

/**
 * Inserts collapse nodes around all content or runs of non-code blocks.
 *
 * The intention is you can then add a serializer that handles nodes
 * with _type == "collapse".
 *
 * @param content The content.
 * @param mode Collapse mode.
 * @returns The updated portable text content.
 */
export const decorateWithCollapseNodes = (
  content: PortableText | undefined,
  mode: DocumentationCollapseMode
): PortableText => {
  if (!content || content.length === 0) {
    return [];
  }
  // Collapsing empty paragraphs looks odd but is easy to do by accident in the CMS.
  content = content.filter(
    (b) =>
      b._type !== "block" ||
      (b.children as []).reduce(
        (prev, curr) => prev + (curr as any).text?.length,
        0
      ) > 0
  );

  // If we're expand/collapsing everything then we don't need to track runs.
  if (mode === DocumentationCollapseMode.ExpandCollapseAll) {
    return [
      {
        _type: "collapse",
        children: content,
        collapseToFirstLine: false,
      },
    ];
  }

  // Only variation now is the treatment of the first run.
  const collapseToFirstLine =
    mode === DocumentationCollapseMode.ExpandCollapseExceptCodeAndFirstLine &&
    content.length > 0 &&
    content[0]._type === "block";

  let result: PortableText = [];
  let run: PortableText = [];
  let runStart: number = -1;
  for (let i = 0; i < content.length; ++i) {
    const block = content[i];
    const isLast = i === content.length - 1;
    const isCode = block._type === "python";
    if (!isCode) {
      if (run.length === 0) {
        runStart = i;
      }
      run.push(block);
    }
    if (isLast || isCode) {
      if (run.length > 0) {
        result.push({
          _type: "collapse",
          children: run,
          collapseToFirstLine: collapseToFirstLine && runStart === 0,
        });
        run = [];
        runStart = -1;
      }
    }
    if (isCode) {
      result.push(block);
    }
  }
  return result;
};
