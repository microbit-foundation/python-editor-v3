import React from "react";
import SidePanel from "./LeftPanel";
import TopNav from "./TopNav";
import "./Workbench.css";
import { ViewPort, Fill, LeftResizable, Top } from "react-spaces";
import EditorIntegration from "../editor/EditorIntegration";
import { useFileSystemBackedText } from "../fs/fs-hooks";
import { MAIN_FILE } from "../fs/fs";

const Workbench = () => {
  // We should add state here for the selected file.
  const filename = MAIN_FILE;
  const [defaultValue, onFileChange] = useFileSystemBackedText(filename);
  return (
    // https://github.com/aeagle/react-spaces
    <ViewPort>
      <Top size="74px">
        <TopNav />
      </Top>
      <Fill>
        <LeftResizable
          size="25%"
          minimumSize={210}
          style={{ borderRight: "4px solid whitesmoke" }}
        >
          <SidePanel />
        </LeftResizable>
        <Fill>
          {defaultValue && (
            <EditorIntegration
              key={filename}
              defaultValue={defaultValue}
              onChange={onFileChange}
            />
          )}
        </Fill>
      </Fill>
    </ViewPort>
  );
};

export default Workbench;
