import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { MAIN_FILE } from "../fs/fs";
import ProjectNameEditable from "../project/ProjectNameEditable";
import EditorContainer from "./EditorContainer";
import NonMainFileNotice from "./NonMainFileNotice";
import ZoomControls from "./ZoomControls";

interface EditorAreaProps extends BoxProps {
  filename: string;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorArea = ({
  filename,
  onSelectedFileChanged,
  ...props
}: EditorAreaProps) => {
  const isMainFile = filename === MAIN_FILE;
  return (
    <Flex height="100%" flexDirection="column" {...props}>
      <Flex
        width="100%"
        backgroundColor="var(--code-background)"
        alignItems="center"
        justifyContent="space-between"
        pl={3}
        pr={3}
        pt={2}
        pb={2}
        borderBottom="1px solid #d3d3d3"
      >
        <ProjectNameEditable />
        <ZoomControls size="md" />
      </Flex>
      {!isMainFile && (
        <NonMainFileNotice
          filename={filename}
          onSelectedFileChanged={onSelectedFileChanged}
        />
      )}
      <Box flex="1 1 auto" height={0}>
        <EditorContainer filename={filename} />
      </Box>
    </Flex>
  );
};

export default EditorArea;
