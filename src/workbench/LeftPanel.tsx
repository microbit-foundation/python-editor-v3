import {
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
  RiFile3Line,
  RiLayoutMasonryFill,
  RiSettings2Line,
} from "react-icons/ri";
import DeviceConnection from "./DeviceConnection";
import Files from "./Files";
import LeftPanelTabContent from "./LeftPanelTabContent";
import Packages from "./Packages";
import Settings from "./Settings";

interface Panel {
  id: string;
  icon: IconType;
  title: string;
  contents: ReactNode;
}

interface PanelsProps {
  panels: Panel[];
}

interface SidePanelProps {
  onSelectedFileChanged: (filename: string) => void;
}

const SidePanel = ({ onSelectedFileChanged }: SidePanelProps) => {
  const panels: Panel[] = useMemo(
    () => [
      {
        id: "packages",
        title: "Packages",
        icon: RiLayoutMasonryFill,
        contents: <Packages />,
      },
      {
        id: "files",
        title: "Files",
        icon: RiFile3Line,
        contents: <Files onSelectedFileChanged={onSelectedFileChanged} />,
      },
      {
        id: "settings",
        title: "Settings",
        icon: RiSettings2Line,
        contents: <Settings />,
      },
    ],
    [onSelectedFileChanged]
  );
  return <Panels panels={panels} />;
};

const Panels = ({ panels }: PanelsProps) => {
  return (
    <Flex height="100%" direction="column">
      <Tabs orientation="vertical" size="lg" variant="line" flex="1 0 auto">
        <TabList height="100%" backgroundColor="whitesmoke">
          {panels.map((p) => (
            <Tab key={p.id}>
              <Icon as={p.icon} aria-label={p.title} />
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {panels.map((p) => (
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

export default SidePanel;
