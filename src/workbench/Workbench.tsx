import React, { useState } from "react";
import { BottomResizable, Fill, LeftResizable, ViewPort } from "react-spaces";
import EditorArea from "../editor/EditorArea";
import { MAIN_FILE } from "../fs/fs";
import SerialArea from "../serial/SerialArea";
import LeftPanel from "./LeftPanel";

/**
 * The main app layout with resizable panels.
 */
const Workbench = () => {
  const [filename, setFilename] = useState(MAIN_FILE);
  return (
    // https://github.com/aeagle/react-spaces
    <ViewPort>
      <Fill>
        <LeftResizable
          size="30%"
          minimumSize={210}
          style={{ borderRight: "4px solid whitesmoke" }}
        >
          <LeftPanel onSelectedFileChanged={setFilename} />
        </LeftResizable>
        <Fill>
          <Fill>
            <EditorArea
              key={filename}
              filename={filename}
              onSelectedFileChanged={setFilename}
            />
          </Fill>
          <BottomResizable
            size="40%"
            style={{ borderTop: "4px solid whitesmoke" }}
          >
            <SerialArea />
          </BottomResizable>
        </Fill>
      </Fill>
    </ViewPort>
  );
};

export default Workbench;
