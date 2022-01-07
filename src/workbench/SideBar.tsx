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
  Link,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
import SideBarTab from "./SideBarTab";

export const cornerSize = 32;

export interface Pane {
  id: string;
  icon: IconType;
  title: string;
  nav?: ReactNode;
  contents: ReactNode;
  color: string;
  mb?: string;
}

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
  const [releaseDialog, setReleaseDialog] = useReleaseDialogState();
  const brand = useDeployment();
  const panes: Pane[] = useMemo(() => {
    const result = [
      {
        id: "explore",
        title: intl.formatMessage({ id: "explore-tab" }),
        icon: PythonLogo as IconType,
        contents: <ExploreArea />,
        color: "gray.50",
      },
      {
        id: "reference",
        title: intl.formatMessage({ id: "reference-tab" }),
        // If you change this icon you also need to change the version embedded
        // in documentation.ts (used for CM documentation tooltips).
        icon: VscLibrary,
        contents: <ReferenceArea />,
        color: "gray.50",
        mb: "auto",
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
        color: "gray.25",
      },
    ];
    return result;
  }, [onSelectedFileChanged, selectedFile, intl]);
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
    // A click on a tab when it's already selected should
    // reset any other parameters so we go back to the top
    // level.
    setParams({
      tab,
    });
  }, [tab, setParams]);

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
          <Box flex={1} maxHeight="8.9rem" minHeight={8}></Box>
          {panes.map((pane, current) => (
            <SideBarTab
              key={pane.id}
              handleTabClick={handleTabClick}
              active={index === current}
              {...pane}
            />
          ))}
          <VStack mt={4} mb={1} spacing={0.5} color="white">
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

export default SideBar;
