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
import { ReactNode, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { RiFolderLine, RiLayoutMasonryFill } from "react-icons/ri";
import FilesArea from "../files/FilesArea";
import FilesAreaNav from "../files/FilesAreaNav";
import HelpMenu from "../project/HelpMenu";
import LanguageMenu from "../project/LanguageMenu";
import LeftPanelTabContent from "./LeftPanelTabContent";
import SettingsButton from "../settings/SettingsButton";
import LogoFace from "../common/LogoFace";

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
        title: "Python",
        icon: RiLayoutMasonryFill,
        contents: (
          <VStack mt="calc(2.6rem + 11.5vh)" pl={8} pr={8} spacing={5}>
            <Text>
              Hi! This is the alpha release of the micro:bit Python editor V3.
            </Text>
            <Text>Help us improve by providing your feedback!</Text>
          </VStack>
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

const cornerSize = 32;

const LeftPanelContents = ({ panes, ...props }: LeftPanelContentsProps) => {
  const [index, setIndex] = useState<number>(0);
  const width = "5.375rem";
  return (
    <Flex height="100%" direction="column" {...props} backgroundColor="gray.50">
      <Tabs
        orientation="vertical"
        size="lg"
        variant="sidebar"
        flex="1 0 auto"
        onChange={setIndex}
        index={index}
      >
        <TabList background="transparent linear-gradient(to bottom, var(--chakra-colors-brand-500) 0%, var(--chakra-colors-blimpTeal-50) 100%) 0% 0% no-repeat padding-box;">
          <Box width="3.75rem" mt="1.375rem" ml="auto" mr="auto" mb="11.5vh">
            <LogoFace fill="white" />
          </Box>
          {panes.map((p, i) => (
            <Tab
              key={p.id}
              color="white"
              height={width}
              width={width}
              p={0}
              position="relative"
            >
              <VStack spacing={0}>
                {i === index && (
                  <Corner
                    position="absolute"
                    bottom={-cornerSize + "px"}
                    right={0}
                  />
                )}
                {i === index && (
                  <Corner
                    position="absolute"
                    top={-cornerSize + "px"}
                    right={0}
                    transform="rotate(90deg)"
                  />
                )}
                <VStack>
                  <Icon boxSize={6} as={p.icon} />
                  <Text m={0} fontSize="sm">
                    {p.title}
                  </Text>
                </VStack>
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

const Corner = (props: BoxProps) => (
  <Box {...props}>
    <svg
      width={cornerSize}
      height={cornerSize}
      viewBox="0 0 263 263"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M263 244C263 250.394 262.754 256.73 262.271 263H263V244ZM19 0C153.758 0 263 109.243 263 244V0H19ZM0 0.728821C6.26993 0.245926 12.6063 0 19 0H0V0.728821Z"
        fill="var(--chakra-colors-gray-50)"
      />
    </svg>
  </Box>
);

export default LeftPanel;
