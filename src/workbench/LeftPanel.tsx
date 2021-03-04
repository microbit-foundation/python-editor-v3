import {
  Center,
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React, { ReactNode, useMemo } from "react";
import { IconType } from "react-icons";
import {
  RiLayoutMasonryFill,
  RiQuestionLine,
  RiSave2Line,
  RiSettings2Line,
} from "react-icons/ri";
import DeviceConnection from "./DeviceConnection";
import Files from "./Files";
import Help from "./Help";
import LeftPanelTabContent from "./LeftPanelTabContent";
import Logo from "./Logo";
import Packages from "./Packages";
import Settings from "./Settings";

interface LeftPanelProps {
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * The tabbed area on the left of the UI offering access to API documentation,
 * files and settings.
 */
const LeftPanel = ({ onSelectedFileChanged }: LeftPanelProps) => {
  const panes: Pane[] = useMemo(
    () => [
      {
        id: "packages",
        title: "Packages",
        icon: RiLayoutMasonryFill,
        contents: <Packages />,
      },
      {
        id: "files",
        title: "Load and save",
        icon: RiSave2Line,
        contents: <Files onSelectedFileChanged={onSelectedFileChanged} />,
      },
      {
        id: "settings",
        title: "Settings",
        icon: RiSettings2Line,
        contents: <Settings />,
      },
      {
        id: "help",
        title: "Help",
        icon: RiQuestionLine,
        contents: <Help />,
      },
    ],
    [onSelectedFileChanged]
  );
  return <LeftPanelContents panes={panes} />;
};

interface Pane {
  id: string;
  icon: IconType;
  title: string;
  contents: ReactNode;
}

interface LeftPanelConentsProps {
  panes: Pane[];
}

const LeftPanelContents = ({ panes }: LeftPanelConentsProps) => {
  return (
    <Flex height="100%" direction="column">
      <Center p={2} pt={3} pb={3}>
        <Logo height={35} />
      </Center>
      <Tabs orientation="vertical" size="lg" variant="line" flex="1 0 auto">
        <TabList height="100%" backgroundColor="whitesmoke">
          {panes.map((p) => (
            <Tab key={p.id}>
              <Icon as={p.icon} aria-label={p.title} />
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {panes.map((p) => (
            <TabPanel key={p.id} p={0} height="100%">
              <LeftPanelTabContent title={p.title}>
                {p.contents}
              </LeftPanelTabContent>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <DeviceConnection />
    </Flex>
  );
};

export default LeftPanel;
