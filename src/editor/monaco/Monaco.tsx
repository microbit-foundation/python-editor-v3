import Editor, { OnChange } from "@monaco-editor/react";
import { EditorComponentProps } from "../editor";

const ptToPixelRatio = 96 / 72;

const Monaco = ({ defaultValue, onChange, fontSize }: EditorComponentProps) => {
  const handleChange: OnChange = (value, event) => {
    if (value) {
      onChange(value);
    }
  };
  return (
    <Editor
      height="100%"
      width="100%"
      defaultLanguage="python"
      defaultValue={defaultValue}
      onChange={handleChange}
      theme="light"
      options={{
        fontSize: ptToPixelRatio * fontSize,
        minimap: {
          enabled: false,
        },
      }}
    />
  );
};

export default Monaco;
