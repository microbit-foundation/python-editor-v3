import { EditorView } from "@codemirror/view";
import { codeFontFamily } from "../../theme";

export const themeExtensions = (fontSizePt: number) => {
  const fontSize = `${fontSizePt}pt`;
  const fontFamily = codeFontFamily;
  return EditorView.theme({
    ".cm-content": {
      fontSize,
      fontFamily,
      padding: 0,
    },
    ".cm-gutters": {
      // Make it easier to copy code dragging from the left without line numbers.
      userSelect: "none",
      backgroundColor: "unset",
      fontSize,
      fontFamily,
      paddingRight: "1rem",
      border: "unset",
      color: "gray.600",
    },
    ".cm-gutter": {
      width: "5rem",
    },
    ".cm-completionIcon": {
      // Seems broken by default
      width: "auto",
      // But they're also cryptic, so hide until we can improve.
      display: "none",
    },
    ".cm-completionLabel": {
      fontSize,
      fontFamily,
    },
    ".cm-activeLine": {
      // The default CM theme sets a background color.
      backgroundColor: "unset",
      outline: "1px solid var(--chakra-colors-gray-100)",
    },
    // $wrap can't be styled here, see App.css.
  });
};

export default themeExtensions;
