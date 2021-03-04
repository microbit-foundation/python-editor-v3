import { Box, Flex } from "@chakra-ui/react";
import { MAIN_FILE } from "../fs/fs";
import { useFileSystemBackedText } from "../fs/fs-hooks";
import { useSettings } from "../settings";
import EditorToolbar from "../workbench/EditorToolbar";
import ZoomControls from "../workbench/ZoomControls";
import Editor from "./Editor";
import NonMainFileNotice from "./NonMainFileNotice";

interface EditorContainerProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorContainer = ({
  filename,
  onSelectedFileChanged,
}: EditorContainerProps) => {
  const [{ fontSize, highlightCodeStructure }] = useSettings();
  const [defaultValue, onFileChange] = useFileSystemBackedText(filename);
  const isMainFile = filename === MAIN_FILE;

  return typeof defaultValue === "undefined" ? null : (
    <Flex height="100%" flexDirection="column">
      <EditorToolbar />
      {!isMainFile && (
        <NonMainFileNotice
          filename={filename}
          onSelectedFileChanged={onSelectedFileChanged}
        />
      )}
      <Box flex="1 1 auto" height={0}>
        <Editor
          defaultValue={defaultValue}
          onChange={onFileChange}
          fontSize={fontSize}
          highlightCodeStructure={highlightCodeStructure}
        />
      </Box>
    </Flex>
  );
};

export default EditorContainer;
