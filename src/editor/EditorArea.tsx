import { Box, BoxProps, Flex } from "@chakra-ui/react";
import ProjectNameEditable from "../project/ProjectNameEditable";
import ActiveFileInfo from "./ActiveFileInfo";
import EditorContainer from "./EditorContainer";
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
  return (
    <Flex
      height="100%"
      flexDirection="column"
      {...props}
      backgroundColor="gray.50"
    >
      <Flex
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        pl="3rem"
        pr={10}
        pt={2}
        pb={2}
      >
        <ProjectNameEditable />
        <ActiveFileInfo
          filename={filename}
          onSelectedFileChanged={onSelectedFileChanged}
        />
        <ZoomControls size="md" />
      </Flex>
      {/* Just for the line */}
      <Box
        ml="6rem"
        mr="1.5rem"
        width="calc(100% - 7.5rem)"
        borderBottomWidth={1}
        borderColor="gray.300"
      />
      <Box flex="1 1 auto" height={0}>
        <EditorContainer filename={filename} />
      </Box>
    </Flex>
  );
};

export default EditorArea;
