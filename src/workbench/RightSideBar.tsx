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
} from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { VscLibrary } from "react-icons/vsc";
import ErrorBoundary from "../common/ErrorBoundary";
import Simulator from "../simulator/Simulator";
import { Pane } from "./SideBar";
import SideBarTab from "./SideBarTab";

interface RightSideBarProps extends BoxProps {
  setSidebarShown: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarShown: boolean;
}

/**
 * The tabbed area on the left of the UI offering access to documentation,
 * files and settings.
 */
const RightSideBar = ({
  setSidebarShown,
  sidebarShown,
  ...props
}: RightSideBarProps) => {
  const panes: Pane[] = useMemo(() => {
    const result = [
      {
        id: "simluator",
        title: "Simulator",
        icon: VscLibrary,
        contents: <Simulator />,
        color: "gray.25",
      },
    ];
    return result;
  }, []);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabPanelsRef = useRef<HTMLDivElement>(null);
  const handleTabChange = useCallback(
    (index: number) => {
      setTabIndex(index);
      setSidebarShown(true);
    },
    [setSidebarShown, setTabIndex]
  );
  const handleTabClick = useCallback(() => {
    setSidebarShown(!sidebarShown);
    setTabIndex(-1);
  }, [setSidebarShown, sidebarShown]);

  return (
    <Flex height="100%" direction="column" {...props} backgroundColor="gray.25">
      <Tabs
        orientation="vertical"
        size="lg"
        variant="sidebar"
        flex="1 0 auto"
        onChange={handleTabChange}
        index={tabIndex}
        isManual={true}
      >
        <TabPanels ref={tabPanelsRef} mr={sidebarShown ? "43px" : 0}>
          {panes.map((p) => (
            <TabPanel key={p.id} p={0} height="100%">
              <Flex height="100%" direction="column">
                <ErrorBoundary>{p.contents}</ErrorBoundary>
              </Flex>
            </TabPanel>
          ))}
        </TabPanels>
        <TabList
          position={sidebarShown ? "fixed" : "relative"}
          right={0}
          height="100vh"
        >
          <Box flex={1} maxHeight="8.9rem" minHeight={8}></Box>
          {panes.map((pane, current) => (
            <SideBarTab
              key={pane.id}
              handleTabClick={handleTabClick}
              active={tabIndex === current}
              tabIndex={tabIndex}
              cornerSize={16}
              size="sm"
              facingDirection="left"
              {...pane}
            />
          ))}
        </TabList>
      </Tabs>
    </Flex>
  );
};

export default RightSideBar;
