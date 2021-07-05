/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex } from "@chakra-ui/layout";
import { useEffect } from "react";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import EditorArea from "../editor/EditorArea";
import { MAIN_FILE } from "../fs/fs";
import { useProject } from "../project/project-hooks";
import ProjectActionBar from "../project/ProjectActionBar";
import SerialArea from "../serial/SerialArea";
import LeftPanel from "./LeftPanel";
import SplitView from "./SplitView";
import { useSelection } from "./use-selection";

const minimums: [number, number] = [380, 580];

/**
 * The main app layout with resizable panels.
 */
const Workbench = () => {
  const [selectedFile, setSelectedFile] = useSelection();
  const { files } = useProject();
  useEffect(() => {
    // No file yet or selected file deleted? Default it.
    if (
      (!selectedFile || !files.find((x) => x.name === selectedFile)) &&
      files.length > 0
    ) {
      const defaultFile = files.find((x) => x.name === MAIN_FILE) || files[0];
      setSelectedFile(defaultFile.name);
    }
  }, [selectedFile, setSelectedFile, files]);

  const fileVersion = files.find((f) => f.name === selectedFile)?.version;

  const serialVisible = useConnectionStatus() === ConnectionStatus.CONNECTED;
  return (
    <Flex className="Workbench">
      <SplitView direction="row" width="100%" minimums={minimums}>
        <LeftPanel
          selectedFile={selectedFile}
          onSelectedFileChanged={setSelectedFile}
          flex="1 1 100%"
        />
        <Flex
          flex="1 1 100%"
          flexDirection="column"
          height="100%"
          boxShadow="4px 0px 24px #00000033"
        >
          <SplitView direction="column" minimums={[400, 300]} height="100%">
            <Box height="100%">
              {selectedFile && fileVersion !== undefined && (
                <EditorArea
                  key={selectedFile + "/" + fileVersion}
                  filename={selectedFile}
                  onSelectedFileChanged={setSelectedFile}
                />
              )}
            </Box>
            <SerialArea visibility={serialVisible ? "unset" : "hidden"} />
          </SplitView>
          <ProjectActionBar borderTopWidth={1} borderColor="gray.200" />
        </Flex>
      </SplitView>
    </Flex>
  );
};

export default Workbench;
