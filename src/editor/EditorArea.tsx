import { Box, BoxProps, Flex } from "@chakra-ui/react";
import Logo from "../common/Logo";
import LogoStacked from "../common/LogoStacked";
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
      backgroundColor="gray.10"
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
        <Box width="140px" fill="var(--chakra-colors-brand-500)">
          <Logo/>
        </Box>
      </Flex>
      {/* Just for the line */}
      <Box
        ml="6rem"
        mr="1.5rem"
        width="calc(100% - 7.5rem)"
        borderBottomWidth={1}
        borderColor="gray.200"
      />
      <Box position="relative" flex="1 1 auto" height={0}>
        <ZoomControls zIndex="1" top="15px" right="20px" position="absolute"/>
        <EditorContainer filename={filename} />
      </Box>
    </Flex>
  );
};

export default EditorArea;
