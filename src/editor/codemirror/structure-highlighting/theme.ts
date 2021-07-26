import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.baseTheme({
  // The layer we add to CM's DOM.
  // We set additional classes here to vary the formatting of the descendant blocks.
  // See VisualBlock for the element creation code.
  ".cm-cs--layer": {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    zIndex: -3,
  },
  ".cm-cs--block, .cm-cs--indent": {
    display: "block",
    position: "absolute",
  },
  ".cm-cs--block": {
    borderRadius: "var(--chakra-radii-lg)",
  },
  // Disable border radius when it looks bad.
  ".cm-cs--lshapes .cm-cs--block": {
    borderRadius: "unset",
  },
  ".cm-cs--borders-left-edge-only .cm-cs--block": {
    borderRadius: "unset",
  },

  ".cm-cs--background-block .cm-cs--block": {
    backgroundColor: "var(--chakra-colors-code-blockBackground)",
  },
  ".cm-cs--background-block.cm-cs--cursor-background .cm-cs--block.cm-cs--active":
    {
      backgroundColor: "var(--chakra-colors-code-blockBackgroundActive)",
    },
  ".cm-cs--lshapes .cm-cs--body": {
    // Keep corner flush with parent above in the l-shape.
    borderTopLeftRadius: "unset",
  },

  // l-shaped left-edge-only border
  ".cm-cs--lshapes.cm-cs--borders-left-edge-only .cm-cs--indent": {
    borderRight: "2px solid var(--chakra-colors-code-blockBorder)",
    borderTop: "2px solid var(--chakra-colors-code-blockBorder)",
  },
  // boxes left-edge only border
  ".cm-cs--boxes.cm-cs--borders-left-edge-only .cm-cs--block": {
    borderLeft: "2px solid var(--chakra-colors-code-blockBorder)",
  },

  // l-shapes full border
  ".cm-cs--lshapes.cm-cs--borders-borders .cm-cs--indent": {
    borderTop: "2px solid var(--chakra-colors-code-blockBorder)",
  },
  ".cm-cs--lshapes.cm-cs--borders-borders .cm-cs--parent": {
    borderTop: "2px solid var(--chakra-colors-code-blockBorder)",
    borderRight: "2px solid var(--chakra-colors-code-blockBorder)",
    borderLeft: "2px solid var(--chakra-colors-code-blockBorder)",
  },
  ".cm-cs--lshapes.cm-cs--borders-borders .cm-cs--body": {
    borderRight: "2px solid var(--chakra-colors-code-blockBorder)",
    borderLeft: "2px solid var(--chakra-colors-code-blockBorder)",
    borderBottom: "2px solid var(--chakra-colors-code-blockBorder)",
  },

  // boxes full border
  ".cm-cs--boxes.cm-cs--borders-borders .cm-cs--block": {
    border: "2px solid var(--chakra-colors-code-blockBorder)",
  },

  // active border
  // for now we assume the border is already present but could restate border CSS
  ".cm-cs--background-block.cm-cs--cursor-border .cm-cs--block.cm-cs--active, .cm-cs--background-block.cm-cs--cursor-border .cm-cs--indent.cm-cs--active":
    {
      borderColor: "var(--chakra-colors-code-blockBorderActive)",
    },
});

export const themeTweakForBackgrounds = EditorView.theme({
  ".cm-activeLine": {
    // Can't use background colour for conflicting purposes.
    backgroundColor: "unset",
    outline: "1px solid var(--chakra-colors-gray-100)",
  },
});
