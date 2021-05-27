import { HighlightStyle, tags } from "@codemirror/highlight";

export const myHighlightStyle = () => {
  const dark = "var(--chakra-colors-gray-800)";
  return HighlightStyle.define([
    {
      tag: tags.comment,
      color: "var(--chakra-colors-brand-650)",
    },
    { tag: tags.literal, color: "var(--chakra-colors-blimpTeal-400)" },
    { tag: tags.string, color: "var(--highlight-style-string)" },
    { tag: tags.keyword, color: "var(--highlight-style-keyword)" },
    { tag: tags.name, color: dark },
    { tag: tags.meta, color: dark },
    { tag: tags.operator, color: dark },
    { tag: tags.punctuation, color: dark },

    // We can colour these in future to indicate function and method calls
    // but try after https://github.com/codemirror/lang-python/pull/1 is available
    // { tag: tags.function(tags.propertyName), color: "orange" },
    // { tag: tags.function(tags.variableName), color: "orange" },
  ]);
};

export default myHighlightStyle;
