/**
 * Prefix each line with the given indent.
 *
 * @param text The text to indent.
 * @param indent The indent to add.
 * @returns The indented text.
 */
export const indentBy = (text: string, indent: string) => {
  if (indent === "") {
    return text;
  }
  return text
    .split("\n")
    .map((p) => indent + p)
    .join("\n");
};

/**
 * Remove any common indent.
 *
 * @param text The text.
 * @returns The text with any indent common to all non-blank lines removed.
 */
export const removeCommonIndent = (text: string) => {
  const lines = text.split("\n");
  let common: number | undefined;
  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }
    const spaces = leadingSpaces(line);
    if (common === undefined) {
      common = spaces;
    } else {
      common = Math.min(common, spaces);
    }
  }
  if (common === undefined) {
    return text;
  }
  return lines.map((l) => l.slice(common)).join("\n");
};

const leadingSpaces = (str: string): number => {
  let spaces = 0;
  for (let i = 0; i < str.length; ++i) {
    if (str.charAt(i) === " ") {
      spaces++;
    } else {
      break;
    }
  }
  return spaces;
};
