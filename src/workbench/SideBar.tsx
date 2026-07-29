/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@microbit/ui";
import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { TabList, TabPanel, TabPanels, Tabs } from "react-aria-components";
import { IconType } from "react-icons";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { VscFiles, VscLibrary } from "react-icons/vsc";
import { useIntl } from "react-intl";
import { css } from "styled-system/css";
import { Box, Flex, styled, VStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import ErrorBoundary from "../common/ErrorBoundary";
import PythonLogo from "../common/PythonLogo";
import ApiArea from "../documentation/ApiArea";
import IdeasArea from "../documentation/IdeasArea";
import ReferenceArea from "../documentation/ReferenceArea";
import { flags } from "../flags";
import ProjectArea from "../project/ProjectArea";
import { TabName, useRouterState } from "../router-hooks";
import SettingsMenu from "../settings/SettingsMenu";
import HelpMenu from "./HelpMenu";
import PreReleaseNotice, { useReleaseDialogState } from "./PreReleaseNotice";
import ReleaseDialogs from "./ReleaseDialogs";
import SideBarHeader from "./SideBarHeader";
import SideBarTab from "./SideBarTab";

export const cornerSize = 32;

export interface Pane {
  id: TabName;
  icon: IconType;
  title: string;
  contents: ReactNode;
  color: string;
  mb?: string;
}

interface SideBarProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (filename: string) => void;
  shown: boolean;
  tabIndex: number;
  onTabIndexChange: (index: number) => void;

  onSidebarExpand: () => void;
  onSidebarCollapse: () => void;
  "aria-label"?: string;
  css?: SystemStyleObject;
}

/**
 * The tabbed area on the left of the UI offering access to documentation,
 * files and settings.
 */
const SideBar = ({
  selectedFile,
  onSelectedFileChanged,
  shown,
  tabIndex,
  onTabIndexChange,
  onSidebarCollapse,
  onSidebarExpand,
  css: cssProp,
  ...props
}: SideBarProps) => {
  const intl = useIntl();
  const [releaseDialog, setReleaseDialog] = useReleaseDialogState();
  const panes: Pane[] = useMemo(() => {
    const result = [
      {
        id: "reference" as const,
        title: intl.formatMessage({ id: "reference-tab" }),
        icon: VscLibrary,
        contents: <ReferenceArea />,
        color: "gray.25",
      },
      {
        id: "ideas" as const,
        title: intl.formatMessage({ id: "ideas-tab" }),
        icon: RiLightbulbFlashLine,
        contents: <IdeasArea />,
        color: "gray.25",
      },
      {
        id: "api" as const,
        title: intl.formatMessage({ id: "api-tab" }),
        icon: PythonLogo as IconType,
        contents: <ApiArea />,
        color: "gray.25",
        mb: "auto",
      },
      {
        id: "project" as const,
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
  const [{ tab, slug, focus }, setParams] = useRouterState();
  const tabPanelsRef = useRef<HTMLDivElement>(null);
  const setPanelFocus = () => {
    // The focusable wrapper we render inside the active panel. It can't be
    // the react-aria TabPanel itself: its tabindex is owned by react-aria's
    // has-tabbable-child check, which removes one set from outside React
    // (blurring to body), and TabPanelProps accepts no tabIndex.
    const activePanel = tabPanelsRef.current!.querySelector(
      "[role='tabpanel']:not([hidden]):not([inert]) > [data-panel-content]"
    );
    (activePanel as HTMLElement | null)?.focus();
  };
  useEffect(() => {
    // Initialize from the router state. Start-up and navigation.
    const tabIndex = panes.findIndex((p) => p.id === tab);
    if (tabIndex !== -1) {
      onTabIndexChange(tabIndex);
      onSidebarExpand();
      if (!slug || focus) {
        setPanelFocus();
      }
    }
  }, [onSidebarExpand, panes, onTabIndexChange, tab, slug, focus]);

  const previouslyShown = usePrevious(shown);
  useEffect(() => {
    // Prevents the sidebar stealing focus on initial load.
    if (
      shown &&
      (!slug || focus) &&
      previouslyShown !== undefined &&
      previouslyShown !== shown
    ) {
      setPanelFocus();
    }
  }, [previouslyShown, shown, slug, focus]);

  const handleTabChange = useCallback(
    (index: number) => {
      onTabIndexChange(index);
      setParams({ tab: panes[index]?.id });
      onSidebarExpand();
    },
    [onSidebarExpand, onTabIndexChange, panes, setParams]
  );
  const handleTabClick = useCallback(
    (id: TabName) => {
      if (tabIndex === -1) {
        // react-aria tabs cannot be selection-less, so while collapsed the
        // previous selection is retained (but not styled). Clicking it
        // fires no selection change, so expand from the click instead.
        handleTabChange(panes.findIndex((p) => p.id === id));
      } else if (slug) {
        // A click on a tab when it's already selected should
        // reset any other parameters so we go back to the top
        // level.
        setParams({
          tab,
        });
      }
    },
    [handleTabChange, panes, slug, tab, tabIndex, setParams]
  );

  // react-stately force-selects the first tab (and fires onSelectionChange)
  // if the controlled selectedKey is null, so the collapsed sidebar keeps
  // the last real selection; `active` (index-based) drives the styling.
  const lastSelectedIdRef = useRef<TabName>(panes[0].id);
  if (tabIndex >= 0 && panes[tabIndex]) {
    lastSelectedIdRef.current = panes[tabIndex].id;
  }
  const selectedKey =
    tabIndex >= 0 && panes[tabIndex]
      ? panes[tabIndex].id
      : lastSelectedIdRef.current;

  return (
    <styled.section
      display="flex"
      height="100%"
      flexDirection="column"
      backgroundColor="gray.25"
      css={cssProp}
      {...props}
    >
      <SideBarHeader
        sidebarShown={shown}
        onSidebarToggled={() => {
          if (tabIndex === -1) {
            const index = panes.findIndex((p) => p.id === tab);
            onTabIndexChange(index !== -1 ? index : 0);
            onSidebarExpand();
          } else {
            onSidebarCollapse();
          }
        }}
      />
      <Tabs
        orientation="vertical"
        keyboardActivation="manual"
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          const index = panes.findIndex((p) => p.id === key);
          if (index !== tabIndex) {
            handleTabChange(index);
          }
        }}
        className={css({
          display: "flex",
          flexDirection: "row",
          flex: "1 0 auto",
          minHeight: 0,
        })}
      >
        {/* The tab strip: spacer + tabs + settings/help menus over the
            branded background (a wrapper because react-aria's TabList may
            only contain tabs). */}
        <Flex direction="column" background="sidebarTablistBg">
          <Box flex="1" maxHeight="8.9rem" minHeight="8"></Box>
          <TabList
            // Flexes so the API tab's mb:auto pushes the project tab (and
            // the menus below the list) to the bottom, as in the old
            // single-column tablist.
            className={css({
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
            })}
          >
            {panes.map((pane, current) => (
              <SideBarTab
                key={pane.id}
                handleTabClick={handleTabClick}
                active={tabIndex === current}
                tabIndex={tabIndex}
                {...pane}
              />
            ))}
          </TabList>
          <VStack mt="4" mb="1" gap="0.5" color="white">
            <SettingsMenu size="lg" />
            <HelpMenu size="lg" />
          </VStack>
        </Flex>
        <TabPanels
          ref={tabPanelsRef}
          className={css({ flex: "1 1 auto", minWidth: "0" })}
        >
          {panes.map((p) => (
            <TabPanel
              key={p.id}
              id={p.id}
              shouldForceMount
              className={css({
                p: "0",
                height: "100%",
                "&[inert], &[data-inert]": { display: "none" },
              })}
            >
              <Flex
                height="100%"
                direction="column"
                // Programmatically focusable (setPanelFocus) without being
                // a tab stop.
                tabIndex={-1}
                data-panel-content
                outline="none"
              >
                <ErrorBoundary>
                  {p.contents}
                  {flags.betaNotice && (
                    <PreReleaseNotice onDialogChange={setReleaseDialog} />
                  )}
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
    </styled.section>
  );
};

export default SideBar;
