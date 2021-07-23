import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.baseTheme({
  // common
  ".cm-codestructure": {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    zIndex: -1,
  },

  // l-shape-boxes
  ".cm-lshapebox": {
    display: "block",
    position: "absolute",
    backgroundColor: "var(--chakra-colors-code-block)",
    borderRadius: "var(--chakra-radii-lg)",
  },

  // l-shapes
  ".cm-lshape": {
    display: "block",
    position: "absolute",
    borderRight: "2px solid var(--chakra-colors-blimpTeal-100)",
    borderTop: "2px solid var(--chakra-colors-blimpTeal-100)",
  },

  // boxes
  ".cm-box": {
    display: "block",
    position: "absolute",
    backgroundColor: "var(--chakra-colors-code-block)",
    borderRadius: "var(--chakra-radii-lg)",
  },
});

export const themeTweakForBackgrounds = EditorView.theme({
  ".cm-activeLine": {
    // Can't use background colour for conflicting purposes.
    backgroundColor: "unset",
    outline: "1px solid var(--chakra-colors-gray-100)",
  },
});
