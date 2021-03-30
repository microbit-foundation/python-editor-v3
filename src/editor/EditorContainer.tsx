import { useProjectFileText } from "../project/project-hooks";
import { useSettings } from "../settings/settings";
import Editor from "./ace/Ace";

interface EditorContainerProps {
  filename: string;
}

/**
 * Container for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorContainer = ({ filename }: EditorContainerProps) => {
  const [{ fontSize, highlightCodeStructure }] = useSettings();
  const [defaultValue, onFileChange] = useProjectFileText(filename);
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
