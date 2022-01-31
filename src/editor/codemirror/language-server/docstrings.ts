/**
 * This file is also used by the worker so should have no dependencies.
 */

export const splitDocString = (
  markup: string
): [string, string | undefined] => {
  // Workaround for https://github.com/microbit-foundation/python-editor-next/issues/501
  if (markup.startsWith("\\\n")) {
    markup = markup.substring(2);
  }
  const parts = markup.split(/\n{2,}/g);
  const first = parts[0];
  const remainder = parts.length > 1 ? parts.slice(1).join("\n\n") : undefined;
  return [first, remainder];
};

export const firstParagraph = (markup: string) => splitDocString(markup)[0];
