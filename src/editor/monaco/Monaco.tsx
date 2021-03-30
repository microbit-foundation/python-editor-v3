import Editor, { Monaco, OnChange } from "@monaco-editor/react";
import { EditorComponentProps } from "../editor";

const ptToPixelRatio = 96 / 72;

const configureMonaco = (monaco: Monaco) => {
  monaco.editor.defineTheme("microbit", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#fffff8", // CSS variable doesn't work here
    },
  });
};

const OurMonaco = ({
  defaultValue,
  onChange,
  fontSize,
}: EditorComponentProps) => {
  const handleChange: OnChange = (value, event) => {
    if (value) {
      onChange(value);
    }
  };
  return (
    <Editor
      beforeMount={configureMonaco}
      height="100%"
      width="100%"
      defaultLanguage="python"
      defaultValue={defaultValue}
      onChange={handleChange}
      theme="microbit"
      options={{
        dragAndDrop: true,
        fontSize: ptToPixelRatio * fontSize,
        minimap: {
          enabled: false,
        },
      }}
    />
  );
};

export default OurMonaco;
