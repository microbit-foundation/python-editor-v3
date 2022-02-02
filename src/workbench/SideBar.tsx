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
import { SizedMode } from "../common/SplitView/SplitView";
import ExploreArea from "../documentation/ExploreArea";
import ReferenceArea from "../documentation/ReferenceArea";
import FilesArea from "../files/FilesArea";
import FilesAreaNav from "../files/FilesAreaNav";
import { useRouterState } from "../router-hooks";
import SettingsMenu from "../settings/SettingsMenu";
import HelpMenu from "./HelpMenu";
import ReleaseDialogs from "./ReleaseDialogs";
import ReleaseNotice, { useReleaseDialogState } from "./ReleaseNotice";
import SideBarHeader from "./SideBarHeader";
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
  sidebarState: SizedMode;
  setSidebarState: React.Dispatch<React.SetStateAction<SizedMode>>;
}

/**
 * The tabbed area on the left of the UI offering access to documentation,
 * files and settings.
 */
const SideBar = ({
  selectedFile,
  onSelectedFileChanged,
  sidebarState,
  setSidebarState,
  ...props
}: SideBarProps) => {
  const intl = useIntl();
  const [releaseDialog, setReleaseDialog] = useReleaseDialogState();
  const panes: Pane[] = useMemo(() => {
    const result = [
      {
        id: "explore",
        title: intl.formatMessage({ id: "explore-tab" }),
        icon: PythonLogo as IconType,
        contents: <ExploreArea />,
        color: "gray.25",
      },
      {
        id: "reference",
        title: intl.formatMessage({ id: "reference-tab" }),
        // If you change this icon you also need to change the version embedded
        // in documentation.ts (used for CM documentation tooltips).
        icon: VscLibrary,
        contents: <ReferenceArea />,
        color: "gray.25",
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
        color: "gray.50",
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
    setSidebarState("open");
  }, [tab, setParams, setSidebarState]);

  return (
    <Flex height="100%" direction="column" {...props} backgroundColor="gray.25">
      <SideBarHeader sidebarState={sidebarState} />
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
        {sidebarState !== "collapsed" && (
          <TabPanels>
            {panes.map((p) => (
              <TabPanel key={p.id} p={0} height="100%">
                <Flex height="100%" direction="column">
                  <ErrorBoundary>
                    {p.nav && (
                      <HStack justifyContent="flex-end">{p.nav}</HStack>
                    )}
                    {p.contents}
                    <ReleaseNotice onDialogChange={setReleaseDialog} />
                  </ErrorBoundary>
                </Flex>
              </TabPanel>
            ))}
          </TabPanels>
        )}
      </Tabs>
      <ReleaseDialogs
        onDialogChange={setReleaseDialog}
        dialog={releaseDialog}
      />
    </Flex>
  );
};

export default SideBar;
