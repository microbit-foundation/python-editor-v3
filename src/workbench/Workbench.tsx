import React from "react";
import SidePanel from "./LeftPanel";
import TopNav from "./TopNav";
import {
  ViewPort,
  Fill,
  LeftResizable,
  Top,
  BottomResizable,
} from "react-spaces";
import EditorIntegration from "../editor/EditorIntegration";
import { useFileSystemBackedText } from "../fs/fs-hooks";
import { MAIN_FILE } from "../fs/fs";
import Placeholder from "../common/Placeholder";

const Workbench = () => {
  // We should add state here for the selected file.
  const filename = MAIN_FILE;
  const [defaultValue, onFileChange] = useFileSystemBackedText(filename);
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
          <BottomResizable size="20%">
            <Placeholder text="This is where serial and the sim go" />
          </BottomResizable>
        </Fill>
      </Fill>
    </ViewPort>
  );
};

export default Workbench;
