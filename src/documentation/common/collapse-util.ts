import { PortableText } from "../../common/sanity";

/**
 * Inserts collapse nodes around runs of non-code blocks.
 *
 * If collapseToFirstLine is enabled then tags the run containing
 * the first line (assuming it's not code) with the collapseToFirstLine
 * prop.
 *
 * The intention is you can then add a serializer that handles nodes
 * with _type == "collapse".
 *
 * @param content The content.
 * @param collapseToFirstLine Flag to show first line when collapsed.
 * @returns The updated portable text content.
 */
export const decorateWithCollapseNodes = (
  content: PortableText | undefined,
  collapseToFirstLine: boolean
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
