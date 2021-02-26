import { Text } from "@codemirror/text";
import { useSettings } from "../settings";
import Editor from "./Editor";

interface EditorInteration {
  className?: string;
  defaultValue: Text;
  onChange: (doc: Text) => void;
}

/**
 * Wrapper for the editor that integrates it with the app settings.
 */
const EditorIntegration = (props: EditorInteration) => {
  const [settings] = useSettings();
  const { fontSize, highlightCodeStructure } = settings;
  return (
    <Editor
      {...props}
      fontSize={fontSize}
      highlightCodeStructure={highlightCodeStructure}
    />
  );
};

export default EditorIntegration;
