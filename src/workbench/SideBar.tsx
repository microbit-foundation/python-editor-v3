/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Icon,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ReactNode, useCallback, useMemo } from "react";
import { IconType } from "react-icons";
import { RiFolderFill } from "react-icons/ri";
import { VscLibrary } from "react-icons/vsc";
import { useIntl } from "react-intl";
import ErrorBoundary from "../common/ErrorBoundary";
import PythonLogo from "../common/PythonLogo";
import { useDeployment } from "../deployment";
import { topBarHeight } from "../deployment/misc";
import ExploreArea from "../documentation/ExploreArea";
import ReferenceArea from "../documentation/ReferenceArea";
import FilesArea from "../files/FilesArea";
import FilesAreaNav from "../files/FilesAreaNav";
import { useRouterState } from "../router-hooks";
import SettingsMenu from "../settings/SettingsMenu";
import HelpMenu from "./HelpMenu";
import ReleaseDialogs from "./ReleaseDialogs";
import ReleaseNotice, { useReleaseDialogState } from "./ReleaseNotice";

interface SideBarProps extends BoxProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (filename: string) => void;
}

/**
 * The tabbed area on the left of the UI offering access to documentation,
 * files and settings.
 */
const SideBar = ({
  selectedFile,
  onSelectedFileChanged,
  ...props
}: SideBarProps) => {
  const intl = useIntl();
  const panes: Pane[] = useMemo(() => {
    const result = [
      {
        id: "explore",
        title: intl.formatMessage({ id: "explore-tab" }),
        icon: PythonLogo as IconType,
        contents: <ExploreArea />,
      },
      {
        id: "reference",
        title: intl.formatMessage({ id: "reference-tab" }),
        // If you change this icon you also need to change the version embedded
        // in documentation.ts (used for CM documentation tooltips).
        icon: VscLibrary,
        contents: <ReferenceArea />,
      },
      {
        id: "files",
        title: intl.formatMessage({ id: "files-tab" }),
        icon: RiFolderFill,
        nav: <FilesAreaNav />,
        contents: (
          <FilesArea
            selectedFile={selectedFile}
            onSelectedFileChanged={onSelectedFileChanged}
          />
        ),
      },
    ];
    return result;
  }, [onSelectedFileChanged, selectedFile, intl]);
  return <SideBarContents {...props} panes={panes} />;
};

interface Pane {
  id: string;
  icon: IconType;
  title: string;
  nav?: ReactNode;
  contents: ReactNode;
}

interface SideBarContentsProps {
  panes: Pane[];
}

const cornerSize = 32;

/**
 * The contents of the left-hand area.
 */
const SideBarContents = ({ panes, ...props }: SideBarContentsProps) => {
  const [releaseDialog, setReleaseDialog] = useReleaseDialogState();
  const [{ tab }, setParams] = useRouterState();
  const tabIndexOf = panes.findIndex((p) => p.id === tab);
  const index = tabIndexOf === -1 ? 0 : tabIndexOf;
  const handleTabChange = useCallback(
    (index: number) => {
      setParams({
        tab: panes[index].id,
      });
    },
    [panes, setParams]
  );
  const handleTabClick = useCallback(() => {
    // The tab change itself is handled above.
    setParams({
      tab,
    });
  }, [tab, setParams]);
  const width = "5rem";
  const brand = useDeployment();
  const intl = useIntl();
  return (
    <Flex height="100%" direction="column" {...props} backgroundColor="gray.50">
      <Flex
        backgroundColor="brand.500"
        boxShadow="0px 4px 16px #00000033"
        zIndex={3}
        height={topBarHeight}
        alignItems="center"
      >
        <Link
          display="block"
          href="https://microbit.org/code/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={intl.formatMessage({ id: "visit-dot-org" })}
        >
          <HStack spacing={3.5} pl={4} pr={4}>
            <Box width="3.56875rem" color="white" role="img">
              {brand.squareLogo}
            </Box>
            <Box width="9.098rem" role="img" color="white">
              {brand.horizontalLogo}
            </Box>
          </HStack>
        </Link>
      </Flex>

      <Tabs
        orientation="vertical"
        size="lg"
        variant="sidebar"
        flex="1 0 auto"
        onChange={handleTabChange}
        index={index}
      >
        <TabList>
          <Box
            width="3.75rem"
            mt="1.2rem"
            ml="auto"
            mr="auto"
            mb="max(11.5vh, 7.7rem)"
          ></Box>
          {panes.map((p, i) => (
            <Tab
              key={p.id}
              color="white"
              height={width}
              width={width}
              p={0}
              position="relative"
              className="sidebar-tab" // Used for custom outline below
              onClick={handleTabClick}
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
                    fontSize={13}
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
              <Flex height="100%" direction="column">
                <ErrorBoundary>
                  {p.nav && <HStack justifyContent="flex-end">{p.nav}</HStack>}
                  {p.contents}
                  <ReleaseNotice onDialogChange={setReleaseDialog} />
                </ErrorBoundary>
              </Flex>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <ReleaseDialogs
        onDialogChange={setReleaseDialog}
        dialog={releaseDialog}
      />
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

export default SideBar;
