import { Box } from "@chakra-ui/react";
import { MAIN_FILE } from "../fs/fs";
import { useFileSystemBackedText } from "../fs/fs-hooks";
import { useSettings } from "../settings";
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

  // The editor scrolling breaks if we try to use flex grow here. Alternatives?
  const noticeHeight = "2.5rem";
  return typeof defaultValue === "undefined" ? null : (
    <Box height="100%">
      {!isMainFile && (
        <NonMainFileNotice
          height={noticeHeight}
          filename={filename}
          onSelectedFileChanged={onSelectedFileChanged}
        />
      )}
      <Box
        height={isMainFile ? "100%" : `calc(100% - ${noticeHeight})`}
        position="relative"
      >
        <ZoomControls
          size="lg"
          position="absolute"
          top={0}
          right={0}
          pt={3}
          // Need to keep them away from the scrollbar
          pr={5}
          zIndex={1}
        />
        <Editor
          defaultValue={defaultValue}
          onChange={onFileChange}
          fontSize={fontSize}
          highlightCodeStructure={highlightCodeStructure}
        />
      </Box>
    </Box>
  );
};

export default EditorContainer;
