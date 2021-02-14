import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Placeholder from "../common/Placeholder";

const RightPanel = () => {
  return (
    <Tabs paddingTop={1} height="100%" variant="enclosed">
      <TabList>
        <Tab>Simulator</Tab>
        <Tab>REPL</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Placeholder />
        </TabPanel>
        <TabPanel>
          <Placeholder />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default RightPanel;
