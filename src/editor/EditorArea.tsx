/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Flex, Link } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import { useDeployment } from "../deployment";
import ProjectNameEditable from "../project/ProjectNameEditable";
import { WorkbenchSelection } from "../workbench/use-selection";
import ActiveFileInfo from "./ActiveFileInfo";
import EditorContainer from "./EditorContainer";
import ZoomControls from "./ZoomControls";

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
  const brand = useDeployment();
  const spacingFromRight = "1.5rem";
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
      >
        <ProjectNameEditable />
        <ActiveFileInfo
          filename={selection.file}
          onSelectedFileChanged={onSelectedFileChanged}
        />
        <Link
          href="https://microbit.org/code/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box
            width="140px"
            fill="brand.500"
            role="img"
            aria-label={intl.formatMessage({ id: "visit-dot-org" })}
          >
            {brand.horizontalLogo}
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
          display={["none", "none", "none", "flex"]}
          zIndex="1"
          top={6}
          right={spacingFromRight}
          position="absolute"
        />
        <EditorContainer selection={selection} />
      </Box>
    </Flex>
  );
};

export default EditorArea;
