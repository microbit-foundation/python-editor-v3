import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { EditorComponentProps } from "../editor";

const ptToPixelRatio = 96 / 72;

const Ace = ({ defaultValue, onChange, fontSize }: EditorComponentProps) => {
  return (
    <AceEditor
      mode="python"
      theme="github"
      tabSize={4}
      height="100%"
      width="100%"
      fontSize={fontSize * ptToPixelRatio}
      defaultValue={defaultValue}
      onChange={onChange}
      name="ace-editor"
      editorProps={{ $blockScrolling: true }}
    />
  );
};

export default Ace;
