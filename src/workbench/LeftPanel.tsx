import {
  Box,
  BoxProps,
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
import React, { ReactNode, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { RiFolderLine, RiLayoutMasonryFill } from "react-icons/ri";
import LogoStacked from "../common/LogoStacked";
import FilesArea from "../files/FilesArea";
import FilesAreaNav from "../files/FilesAreaNav";
import PackagesArea from "../packages/PackagesArea";
import HelpMenu from "../project/HelpMenu";
import LanguageMenu from "../project/LanguageMenu";
import LeftPanelTabContent from "./LeftPanelTabContent";
import SettingsButton from "../settings/SettingsButton";
import Placeholder from "../common/Placeholder";

interface LeftPanelProps extends BoxProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * The tabbed area on the left of the UI offering access to API documentation,
 * files and settings.
 */
const LeftPanel = ({
  selectedFile,
  onSelectedFileChanged,
  ...props
}: LeftPanelProps) => {
  const panes: Pane[] = useMemo(
    () => [
      {
        id: "placeholder",
        title: "Placeholder",
        icon: RiLayoutMasonryFill,
        contents: (
          <Placeholder text="Hi. This is our release of the micro:bit Python editor. Help us improve by providing your feedback!" />
        ),
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

const LeftPanelContents = ({ panes, ...props }: LeftPanelContentsProps) => {
  const [index, setIndex] = useState<number>(0);
  return (
    <Flex height="100%" direction="column" {...props}>
      <Tabs
        orientation="vertical"
        size="lg"
        variant="sidebar"
        flex="1 0 auto"
        onChange={setIndex}
        index={index}
      >
        <TabList backgroundColor="blackAlpha.800">
          {/* Brand: logo should have padding ~ the width of the 'o' */}
          <Box height={20} width={24} p="10px">
            <LogoStacked />
          </Box>
          {panes.map((p) => (
            <Tab key={p.id} color="white" height={20} width={24} p={0}>
              <VStack>
                <Icon boxSize={5} as={p.icon} />
                <Text m={0} fontSize="sm">
                  {p.title}
                </Text>
              </VStack>
            </Tab>
          ))}
          <VStack mt="auto" mb={1} spacing={0.5} color="white">
            <SettingsButton />
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
