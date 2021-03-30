import Editor, { OnChange, useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { EditorComponentProps } from "../editor";

const ptToPixelRatio = 96 / 72;

const Monaco = ({ defaultValue, onChange, fontSize }: EditorComponentProps) => {
  const handleChange: OnChange = (value, event) => {
    if (value) {
      onChange(value);
    }
  };
  const monaco = useMonaco();
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("microbit", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#fffff8", // CSS variable doesn't work here
        },
      });
    }
  }, [monaco]);

  return (
    <Editor
      height="100%"
      width="100%"
      defaultLanguage="python"
      defaultValue={defaultValue}
      onChange={handleChange}
      theme="microbit"
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
