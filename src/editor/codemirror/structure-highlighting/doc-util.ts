import { EditorState } from "@codemirror/state";

export const skipTrailingBlankLines = (
  state: EditorState,
  position: number
) => {
  let line = state.doc.lineAt(position);
  while ((line.length === 0 || /^\s+$/.test(line.text)) && line.number >= 1) {
    line = state.doc.line(line.number - 1);
  }
  return line.to;
};
