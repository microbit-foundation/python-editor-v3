import { useEffect } from "react";
import {
  Bottom,
  BottomResizable,
  Fill,
  LeftResizable,
  ViewPort,
} from "react-spaces";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import EditorArea from "../editor/EditorArea";
import { MAIN_FILE } from "../fs/fs";
import { useProject } from "../project/project-hooks";
import ProjectActionBar from "../project/ProjectActionBar";
import SerialArea from "../serial/SerialArea";
import LeftPanel from "./LeftPanel";
import { useSelection } from "./use-selection";

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
    // https://github.com/aeagle/react-spaces
    <ViewPort>
      <Fill>
        <LeftResizable
          size="30%"
          minimumSize={320}
          style={{ borderRight: "4px solid whitesmoke" }}
        >
          <LeftPanel
            selectedFile={selectedFile}
            onSelectedFileChanged={setSelectedFile}
          />
        </LeftResizable>
        <Fill>
          <Fill>
            <Fill>
              {selectedFile && (
                <EditorArea
                  key={selectedFile + "/" + fileVersion}
                  filename={selectedFile}
                  onSelectedFileChanged={setSelectedFile}
                />
              )}
            </Fill>
            <BottomResizable
              size={serialVisible ? "40%" : "0%"}
              style={{ borderTop: "4px solid whitesmoke" }}
            >
              {/* For accessibility. 
                Using `display` breaks the terminal height adjustment */}
              <SerialArea visibility={serialVisible ? "unset" : "hidden"} />
            </BottomResizable>
          </Fill>
          <Bottom size={58}>
            <ProjectActionBar p={2} borderTop="1px solid #d3d3d3" />
          </Bottom>
        </Fill>
      </Fill>
    </ViewPort>
  );
};

export default Workbench;
