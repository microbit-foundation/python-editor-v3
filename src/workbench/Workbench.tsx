import React, { useState } from "react";
import SidePanel from "./LeftPanel";
import TopNav from "./TopNav";
import { ViewPort, Fill, LeftResizable, Top } from "react-spaces";
import EditorContainer from "../editor/EditorContainer";
import { MAIN_FILE } from "../fs/fs";

const Workbench = () => {
  const [filename, setFilename] = useState(MAIN_FILE);
  return (
    // https://github.com/aeagle/react-spaces
    <ViewPort>
      <Top size={65}>
        <TopNav />
      </Top>
      <Fill>
        <LeftResizable
          size="25%"
          minimumSize={210}
          style={{ borderRight: "4px solid whitesmoke" }}
        >
          <SidePanel onSelectedFileChanged={setFilename} />
        </LeftResizable>
        <Fill>
          <EditorContainer
            key={filename}
            filename={filename}
            onSelectedFileChanged={setFilename}
          />
        </Fill>
      </Fill>
    </ViewPort>
  );
};

export default Workbench;
