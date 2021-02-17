import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Placeholder from "../common/Placeholder";

const RightPanel = () => {
  return (
    <Tabs
      paddingTop={1}
      height="100%"
      variant="enclosed"
      backgroundColor="whitesmoke"
      display="flex"
      flexDirection="column"
    >
      <TabList backgroundColor="whitesmoke" flex="0 0 auto">
        <Tab backgroundColor="white">Simulator</Tab>
        <Tab backgroundColor="white">Serial</Tab>
      </TabList>
      <TabPanels backgroundColor="white" flex="1 0 auto">
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
