import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { EditorComponentProps } from "../editor";

const Ace = ({ defaultValue, onChange }: EditorComponentProps) => {
  return (
    <AceEditor
      mode="python"
      theme="github"
      defaultValue={defaultValue}
      onChange={onChange}
      name="ace-editor"
      editorProps={{ $blockScrolling: true }}
    />
  );
};

export default Ace;
