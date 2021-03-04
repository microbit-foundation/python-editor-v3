import { HStack } from "@chakra-ui/react";
import React from "react";
import DownloadButton from "../workbench/DownloadButton";
import ProjectNameEditable from "../workbench/ProjectNameEditable";
import ZoomControls from "../workbench/ZoomControls";

interface EditorToolbarProps {}

const EditorToolbar = ({}: EditorToolbarProps) => {
  return (
    <HStack
      justifyContent="space-between"
      pt={1}
      pb={1}
      pl={2}
      pr={2}
      backgroundColor="var(--code-background)"
      borderBottom="1px solid #dddddd" // Hack to match the CodeMirror gutter
    >
      <HStack>
        <ProjectNameEditable />
      </HStack>
      <HStack>
        <DownloadButton variant="outline" />
        <ZoomControls />
      </HStack>
    </HStack>
  );
};

export default EditorToolbar;
