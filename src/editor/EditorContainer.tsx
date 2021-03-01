import { useFileSystemBackedText } from "../fs/fs-hooks";
import { useSettings } from "../settings";
import Editor from "./Editor";

interface EditorContainerProps {
  className?: string;
  filename: string;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorContainer = ({ filename, ...props }: EditorContainerProps) => {
  const [settings] = useSettings();
  const { fontSize, highlightCodeStructure } = settings;

  const [defaultValue, onFileChange] = useFileSystemBackedText(filename);
  return typeof defaultValue === "undefined" ? null : (
    <Editor
      {...props}
      defaultValue={defaultValue}
      onChange={onFileChange}
      fontSize={fontSize}
      highlightCodeStructure={highlightCodeStructure}
    />
  );
};

export default EditorContainer;
