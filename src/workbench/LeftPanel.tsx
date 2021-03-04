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
import { RiQuestionLine, RiSave2Line, RiSettings2Line } from "react-icons/ri";
import Face from "./Face";
import Files from "./Files";
import Help from "./Help";
import LeftPanelTabContent from "./LeftPanelTabContent";
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
        icon: Face,
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
      <Tabs orientation="vertical" size="lg" variant="line" flex="1 0 auto">
        <TabList height="100%" backgroundColor="whitesmoke">
          {panes.map((p, index) => (
            <Tab key={p.id} p={index ? undefined : 0}>
              {index ? <Icon as={p.icon} aria-label={p.title} /> : <Face />}
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
    </Flex>
  );
};

export default LeftPanel;
