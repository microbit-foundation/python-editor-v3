import {
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { ReactNode, useMemo } from "react";
import { IconType } from "react-icons";
import {
  RiFolderLine,
  RiLayoutMasonryFill,
  RiSettings2Line,
} from "react-icons/ri";
import FilesArea from "../files/FilesArea";
import FilesAreaNav from "../files/FilesAreaNav";
import PackagesArea from "../packages/PackagesArea";
import HelpMenu from "../project/HelpMenu";
import LanguageMenu from "../project/LanguageMenu";
import SettingsArea from "../settings/SettingsArea";
import LeftPanelTabContent from "./LeftPanelTabContent";

interface LeftPanelProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * The tabbed area on the left of the UI offering access to API documentation,
 * files and settings.
 */
const LeftPanel = ({ selectedFile, onSelectedFileChanged }: LeftPanelProps) => {
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
        icon: RiFolderLine,
        nav: <FilesAreaNav />,
        contents: (
          <FilesArea
            selectedFile={selectedFile}
            onSelectedFileChanged={onSelectedFileChanged}
          />
        ),
      },
      {
        id: "settings",
        title: "Settings",
        icon: RiSettings2Line,
        contents: <SettingsArea />,
      },
    ],
    [onSelectedFileChanged, selectedFile]
  );
  return <LeftPanelContents panes={panes} />;
};

interface Pane {
  id: string;
  icon: IconType;
  title: string;
  nav?: ReactNode;
  contents: ReactNode;
}

interface LeftPanelContentsProps {
  panes: Pane[];
}

const LeftPanelContents = ({ panes }: LeftPanelContentsProps) => {
  return (
    <Flex height="100%" direction="column">
      <Tabs orientation="vertical" size="lg" variant="sidebar" flex="1 0 auto">
        <TabList backgroundColor="blackAlpha.800">
          {panes.map((p) => (
            <Tab key={p.id} color="white" height="4rem" width="5rem" p={0}>
              <VStack>
                <Icon boxSize={5} as={p.icon} />
                <Text m={0} fontSize="xs">
                  {p.title}
                </Text>
              </VStack>
            </Tab>
          ))}
          <VStack mt="auto" mb={1} spacing={0.5} color="white">
            <LanguageMenu size="lg" />
            <HelpMenu size="lg" />
          </VStack>
        </TabList>
        <TabPanels>
          {panes.map((p) => (
            <TabPanel key={p.id} p={0} height="100%">
              <LeftPanelTabContent title={p.title} nav={p.nav}>
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
