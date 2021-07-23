import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.baseTheme({
  // The layer we add to CM's DOM.
  // We set additional classes here to vary the formatting of the descendant blocks.
  ".cm-cs--layer": {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    zIndex: -3,
  },
  ".cm-cs--block": {
    display: "block",
    position: "absolute",
    borderRadius: "var(--chakra-radii-lg)",
  },
  ".cm-cs--background .cm-cs--block": {
    backgroundColor: "var(--chakra-colors-code-block)",
  },
  ".cm-cs--lshapes .cm-cs--body": {
    // Keep corner flush with parent above in the l-shape.
    borderTopLeftRadius: "unset",
  },

  // l-shaped border, hmm this needs a shorter parent element
  ".cm-cs--lshapes.cm-cs--border .hmm": {
    borderRight: "2px solid var(--chakra-colors-blimpTeal-100)",
    borderTop: "2px solid var(--chakra-colors-blimpTeal-100)",
  },
});

export const themeTweakForBackgrounds = EditorView.theme({
  ".cm-activeLine": {
    // Can't use background colour for conflicting purposes.
    backgroundColor: "unset",
    outline: "1px solid var(--chakra-colors-gray-100)",
  },
});
