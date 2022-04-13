/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  BoxProps,
  Flex,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { ReactNode, useCallback, useMemo } from "react";
import { IconType } from "react-icons";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { VscFiles, VscLibrary } from "react-icons/vsc";
import { useIntl } from "react-intl";
import ErrorBoundary from "../common/ErrorBoundary";
import PythonLogo from "../common/PythonLogo";
import ReferenceArea from "../documentation/ReferenceArea";
import IdeasArea from "../documentation/IdeasArea";
import ApiArea from "../documentation/ApiArea";
import ProjectArea from "../project/ProjectArea";
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
  const panes: Pane[] = useMemo(() => {
    const result = [
      {
        id: "reference",
        title: intl.formatMessage({ id: "reference-tab" }),
        icon: VscLibrary,
        contents: <ReferenceArea />,
        color: "gray.25",
      },
      {
        id: "ideas",
        title: intl.formatMessage({ id: "ideas-tab" }),
        icon: RiLightbulbFlashLine,
        contents: <IdeasArea />,
        color: "gray.25",
      },
      {
        id: "api",
        title: "API",
        // If you change this icon you also need to change the version embedded
        // in documentation.ts (used for CM documentation tooltips).
        icon: PythonLogo as IconType,
        contents: <ApiArea />,
        color: "gray.25",
        mb: "auto",
      },
      {
        id: "project",
        title: intl.formatMessage({ id: "project-tab" }),
        icon: VscFiles,
        contents: (
          <ProjectArea
            selectedFile={selectedFile}
            onSelectedFileChanged={onSelectedFileChanged}
          />
        ),
        color: "gray.50",
      },
    ];
    return result;
  }, [onSelectedFileChanged, selectedFile, intl]);
  const [{ tab, reference, api, idea }, setParams] = useRouterState();
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
    if (reference || api || idea) {
      setParams({
        tab,
      });
    }
  }, [reference, api, idea, tab, setParams]);

  return (
    <Flex height="100%" direction="column" {...props} backgroundColor="gray.25">
      <SideBarHeader />
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
