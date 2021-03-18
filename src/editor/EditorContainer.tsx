import { FileVersion } from "../fs/storage";
import { useProjectFileText } from "../project/project-hooks";
import { useSettings } from "../settings/settings";
import Editor from "./codemirror/CodeMirror";

interface EditorContainerProps {
  file: FileVersion;
}

/**
 * Container for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorContainer = ({ file }: EditorContainerProps) => {
  const [{ fontSize, highlightCodeStructure }] = useSettings();
  const [defaultValue, onFileChange] = useProjectFileText(file.name);
  return typeof defaultValue === "undefined" ? null : (
    <Editor
      defaultValue={defaultValue}
      onChange={onFileChange}
      fontSize={fontSize}
      highlightCodeStructure={highlightCodeStructure}
    />
  );
};

export default EditorContainer;
