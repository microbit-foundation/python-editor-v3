/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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
import { useIntl } from "react-intl";
import PythonLogo from "../common/PythonLogo";
import { useDeployment } from "../deployment";
import FilesArea from "../files/FilesArea";
import FilesAreaNav from "../files/FilesAreaNav";
import HelpMenu from "./HelpMenu";
import SettingsMenu from "../settings/SettingsMenu";
import FeedbackArea from "./FeedbackArea";
import LeftPanelTabContent from "./LeftPanelTabContent";
import ApiDocsArea from "../apidocs/ApiDocsArea";

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
  const intl = useIntl();
  const panes: Pane[] = useMemo(
    () => [
      {
        id: "python",
        title: intl.formatMessage({ id: "python-tab" }),
        icon: PythonLogo as IconType,
        contents: <FeedbackArea />,
      },
      {
        id: "files",
        title: intl.formatMessage({ id: "files-tab" }),
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
        id: "api",
        title: "API",
        icon: RiLayoutMasonryFill,
        contents: <ApiDocsArea />,
      },
    ],
    [onSelectedFileChanged, selectedFile, intl]
  );
  return <LeftPanelContents {...props} panes={panes} />;
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

/**
 * The contents of the left-hand area.
 */
const LeftPanelContents = ({ panes, ...props }: LeftPanelContentsProps) => {
  const [index, setIndex] = useState<number>(0);
  const width = "5rem";
  const brand = useDeployment();
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
        <TabList>
          {/* Top margin aims to align with other logo. */}
          <Box width="3.75rem" mt="1.2rem" ml="auto" mr="auto" mb="11.5vh">
            {brand.squareLogo}
          </Box>
          {panes.map((p, i) => (
            <Tab
              key={p.id}
              color="white"
              height={width}
              width={width}
              p={0}
              position="relative"
              className="sidebar-tab" // Used for custom outline below
            >
              <VStack spacing={0}>
                {i === index && (
                  <Corner
                    id="bottom"
                    position="absolute"
                    bottom={-cornerSize + "px"}
                    right={0}
                  />
                )}
                {i === index && (
                  <Corner
                    id="top"
                    position="absolute"
                    top={-cornerSize + "px"}
                    right={0}
                    transform="rotate(90deg)"
                  />
                )}
                <VStack spacing={1}>
                  <Icon boxSize={6} as={p.icon} mt="3px" />
                  <Text
                    m={0}
                    fontSize="sm"
                    borderBottom="3px solid transparent"
                    sx={{
                      ".sidebar-tab:focus &": {
                        // To match the focus outline
                        borderBottom: "3px solid rgba(66, 153, 225, 0.6)",
                      },
                    }}
                  >
                    {p.title}
                  </Text>
                </VStack>
              </VStack>
            </Tab>
          ))}
          <VStack mt="auto" mb={1} spacing={0.5} color="white">
            <SettingsMenu size="lg" />
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

const Corner = ({ id, ...props }: BoxProps) => (
  <Box {...props} pointerEvents="none" width="32px" height="32px">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 32 32"
      overflow="visible"
      fill="var(--chakra-colors-gray-50)"
    >
      <defs>
        <mask id={id}>
          <rect x="0" y="0" width="32" height="32" fill="#fff" />
          <circle r="32" cx="0" cy="32" fill="#000" />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="32"
        height="32"
        fill="var(--chakra-colors-gray-50)"
        mask={`url(#${id})`}
      />
    </svg>
  </Box>
);

export default LeftPanel;
