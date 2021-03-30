import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-kuroir";
import "ace-builds/src-noconflict/ext-language_tools";
import { EditorComponentProps } from "../editor";

const ptToPixelRatio = 96 / 72;

const Ace = ({ defaultValue, onChange, fontSize }: EditorComponentProps) => {
  return (
    <AceEditor
      mode="python"
      theme="kuroir"
      tabSize={4}
      height="100%"
      width="100%"
      enableBasicAutocompletion
      fontSize={fontSize * ptToPixelRatio}
      defaultValue={defaultValue}
      onChange={onChange}
      name="ace-editor"
      editorProps={{ $blockScrolling: true }}
      // This should really be part of the theme but they seem to need
      // be quite painful to get up and running with.
      style={{ backgroundColor: "var(--code-background)" }}
    />
  );
};

export default Ace;
