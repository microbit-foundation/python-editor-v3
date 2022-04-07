/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { topBarHeight } from "../deployment/misc";
import ProjectNameEditable from "../project/ProjectNameEditable";
import { WorkbenchSelection } from "../workbench/use-selection";
import ActiveFileInfo from "./ActiveFileInfo";
import EditorContainer from "./EditorContainer";
import ZoomControls from "../editor/ZoomControls";
import UndoRedoControls from "./UndoRedoControls";

interface EditorAreaProps extends BoxProps {
  selection: WorkbenchSelection;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * Wrapper for the editor that integrates it with the app settings
 * and wires it to the currently open file.
 */
const EditorArea = ({
  selection,
  onSelectedFileChanged,
  ...props
}: EditorAreaProps) => {
  const intl = useIntl();
  return (
    <Flex
      height="100%"
      flexDirection="column"
      {...props}
      backgroundColor="gray.10"
    >
      <Flex
        as="section"
        aria-label={intl.formatMessage({ id: "project-header" })}
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        pl="3rem"
        pr={10}
        pt={2}
        pb={2}
        height={topBarHeight}
      >
        <ProjectNameEditable
          color="gray.700"
          opacity="80%"
          fontSize="xl"
          data-testid="project-name"
          clickToEdit
        />
        <ActiveFileInfo
          filename={selection.file}
          onSelectedFileChanged={onSelectedFileChanged}
        />
        <ZoomControls display={["none", "none", "none", "flex"]} />
      </Flex>
      {/* Just for the line */}
      <Box
        ml="6rem"
        mr="2.5rem"
        mb={5}
        width="calc(100% - 8.5rem)"
        borderBottomWidth={2}
        borderColor="gray.200"
      />
      <Box position="relative" flex="1 1 auto" height={0}>
        <UndoRedoControls
          display={["none", "none", "none", "flex"]}
          zIndex="1"
          top={6}
          right={10}
          position="absolute"
        />
        <EditorContainer selection={selection} />
      </Box>
    </Flex>
  );
};

export default EditorArea;
