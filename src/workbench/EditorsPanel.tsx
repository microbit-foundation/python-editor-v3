/**
 * Currently unused.
 * Useful as a UI demo of what we'd need to do if we wanted multiple
 * editors, or perhaps just to make the name of main.py prominent.
 */
import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Editor from "../editor/Editor";
import { Text } from "@codemirror/state";

interface EditorsPanel {
  value: Text;
  onDocChanged: (text: Text) => void;
}

const EditorsPanel = ({ value, onDocChanged }: EditorsPanel) => {
  return (
    <Tabs
      paddingTop={1}
      height="100%"
      variant="enclosed"
      display="flex"
      flexDir="column"
      backgroundColor="whitesmoke"
    >
      <TabList backgroundColor="whitesmoke">
        <Tab backgroundColor="white">main.py</Tab>
      </TabList>
      {/* Can we replace this with flex? Check editor isn't too tall. */}
      <TabPanels height="calc(100% - 41px)">
        <TabPanel height="100%" padding="0">
          <Editor initialValue={value} onChange={onDocChanged} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default EditorsPanel;
