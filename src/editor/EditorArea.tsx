import { Box, BoxProps, Flex, Link } from "@chakra-ui/react";
import Logo from "../common/Logo";
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
  const spacingFromRight = "1.5rem";
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
        <Link
          href="https://microbit.org/code/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box width="140px" fill="brand.500">
            <Logo />
          </Box>
        </Link>
      </Flex>
      {/* Just for the line */}
      <Box
        ml="6rem"
        mr={spacingFromRight}
        width="calc(100% - 7.5rem)"
        borderBottomWidth={1}
        borderColor="gray.200"
      />
      <Box position="relative" flex="1 1 auto" height={0}>
        <ZoomControls
          zIndex="1"
          top={6}
          right={spacingFromRight}
          position="absolute"
        />
        <EditorContainer filename={filename} />
      </Box>
    </Flex>
  );
};

export default EditorArea;
