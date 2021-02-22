import React from "react";
import SidePanel from "./LeftPanel";
import { Text } from "@codemirror/state";
import TopNav from "./TopNav";
import "./Workbench.css";
import { ViewPort, Fill, LeftResizable, Top } from "react-spaces";
import Editor from "../editor/Editor";

interface WorkbenchProps {
  value: Text;
  onDocChanged: (text: Text) => void;
}

const Workbench = ({ value, onDocChanged }: WorkbenchProps) => (
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
        <Editor onChange={onDocChanged} initialValue={value} />
      </Fill>
    </Fill>
  </ViewPort>
);

export default Workbench;
