import {
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import React, { ReactNode, useMemo } from "react";
import { IconType } from "react-icons";
import {
  RiFile3Line,
  RiLayoutMasonryFill,
  RiSettings2Line,
} from "react-icons/ri";
import LogoBar from "../common/LogoBar";
import PackagesArea from "../packages/PackagesArea";
import SettingsArea from "../settings/SettingsArea";
import FilesArea from "../files/FilesArea";
import LeftPanelTabContent from "./LeftPanelTabContent";
import HelpMenu from "./HelpMenu";

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
        contents: <PackagesArea />,
      },
      {
        id: "files",
        title: "Files",
        icon: RiFile3Line,
        contents: <FilesArea onSelectedFileChanged={onSelectedFileChanged} />,
      },
      {
        id: "settings",
        title: "Settings",
        icon: RiSettings2Line,
        contents: <SettingsArea />,
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

interface LeftPanelContentsProps {
  panes: Pane[];
}

const LeftPanelContents = ({ panes }: LeftPanelContentsProps) => {
  return (
    <Flex height="100%" direction="column">
      <LogoBar />
      <Tabs orientation="vertical" size="lg" variant="line" flex="1 0 auto">
        <TabList backgroundColor="whitesmoke">
          {panes.map((p) => (
            <Tab key={p.id}>
              <Icon as={p.icon} aria-label={p.title} />
            </Tab>
          ))}
          <VStack mt="auto" mb={1}>
            <HelpMenu />
          </VStack>
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
