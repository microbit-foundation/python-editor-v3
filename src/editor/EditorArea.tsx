import { Box, Flex } from "@chakra-ui/react";
import { MAIN_FILE } from "../fs/fs";
import ProjectNameEditable from "../project/ProjectNameEditable";
import EditorContainer from "./EditorContainer";
import NonMainFileNotice from "./NonMainFileNotice";
import ZoomControls from "./ZoomControls";

interface EditorAreaProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorArea = ({ filename, onSelectedFileChanged }: EditorAreaProps) => {
  const isMainFile = filename === MAIN_FILE;
  return (
    <Flex height="100%" flexDirection="column">
      {!isMainFile && (
        <NonMainFileNotice
          filename={filename}
          onSelectedFileChanged={onSelectedFileChanged}
        />
      )}
      <Box flex="1 1 auto" height={0} position="relative">
        <ZoomControls
          size="lg"
          display={["none", "none", "flex"]}
          position="absolute"
          top={0}
          right={0}
          pt={3}
          // Need to keep them away from the scrollbar
          pr={5}
          zIndex={1}
        />
        <EditorContainer filename={filename} />
      </Box>
      <Flex
        width="100%"
        backgroundColor="var(--code-background)"
        justifyContent="flex-end"
        alignItems="center"
        h={10}
        pb={1}
        pt={0}
        pr={2}
      >
        <ProjectNameEditable />
      </Flex>
    </Flex>
  );
};

export default EditorArea;
