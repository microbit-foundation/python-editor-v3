/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex } from "@chakra-ui/layout";
import { useMediaQuery } from "@chakra-ui/react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  hideSidebarMediaQuery,
  sidebarToWidthRatio,
  simulatorToWidthRatio,
  widthToHideSidebar,
} from "../common/screenWidthUtils";
import {
  SplitView,
  SplitViewDivider,
  SplitViewRemainder,
  SplitViewSized,
} from "../common/SplitView";
import { SizedMode } from "../common/SplitView/SplitView";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { useConnectionStatus } from "../device/device-hooks";
import EditorArea from "../editor/EditorArea";
import { FileVersion, MAIN_FILE } from "../fs/fs";
import { useProject } from "../project/project-hooks";
import ProjectActionBar from "../project/ProjectActionBar";
import SerialArea from "../serial/SerialArea";
import { useSettings } from "../settings/settings";
import Simulator from "../simulator/Simulator";
import Overlay from "./connect-dialogs/Overlay";
import SideBar from "./SideBar";
import { WorkbenchSelection, useSelection } from "./use-selection";
import { flags } from "../flags";

const minimums: [number, number] = [380, 580];
const simulatorMinimums: [number, number] = [275, 0];

const defaultSelection = (
  selection: WorkbenchSelection,
  files: FileVersion[]
) => {
  // Selected file deleted? Default it.
  if (!files.find((x) => x.name === selection.file) && files.length > 0) {
    const defaultFile = files.find((x) => x.name === MAIN_FILE) ?? files[0];
    return { file: defaultFile.name, location: { line: undefined } };
  }
  return selection;
};

/**
 * The main app layout with resizable panels.
 */
const Workbench = () => {
  const intl = useIntl();

  const [maybeInvalidSelection, setSelection] = useSelection();
  const { files } = useProject();
  const selection = defaultSelection(maybeInvalidSelection, files);
  const setSelectedFile = useCallback(
    (file: string) => {
      setSelection({ file, location: { line: undefined } });
    },
    [setSelection]
  );

  useEffect(() => {
    const scriptId = "crowdin-jipt";
    if (
      document.getElementById("crowdin-jipt-config") &&
      flags.translate &&
      !document.getElementById(scriptId)
    ) {
      // Add Crowdin just in place translation script
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.src = "//cdn.crowdin.com/jipt/jipt.js";
      document.head.appendChild(script);
    }
  }, []);

  const fileVersion = files.find((f) => f.name === selection.file)?.version;

  const [sidebarShown, setSidebarShown] = useState<boolean>(
    () => window.innerWidth > widthToHideSidebar
  );
  const [simulatorShown, setSimulatorShown] = useState<boolean>(true);
  const simulatorButtonRef = useRef<HTMLButtonElement>(null);
  const [tabIndex, setTabIndex] = useState<number>(() =>
    window.innerWidth > widthToHideSidebar ? 0 : -1
  );
  const [simFocus, setSimFocus] = useState<boolean>(true);

  // Sidebar/simulator space management:
  const handleSidebarCollapse = useCallback(() => {
    setTabIndex(-1);
    setSidebarShown(false);
  }, []);
  const handleSidebarExpand = useCallback(() => {
    setSidebarShown(true);
    // If there's not room for the simulator then hide it.
    if (window.innerWidth <= widthToHideSidebar) {
      setSimFocus(false);
      setSimulatorShown(false);
    }
  }, []);
  const handleSimulatorHide = useCallback(() => {
    setSimFocus(true);
    setSimulatorShown(false);
  }, []);
  const handleSimulatorExpand = useCallback(() => {
    setSimulatorShown(true);
    // If there's not room for the sidebar then hide it.
    if (window.innerWidth <= widthToHideSidebar) {
      handleSidebarCollapse();
    }
  }, [handleSidebarCollapse]);
  const [hideSideBarMediaQueryValue] = useMediaQuery(hideSidebarMediaQuery, {
    ssr: false,
  });
  useEffect(() => {
    if (hideSideBarMediaQueryValue) {
      handleSidebarCollapse();
    }
  }, [hideSideBarMediaQueryValue, handleSidebarCollapse]);

  const editor = (
    <Box height="100%" as="section">
      {selection && fileVersion !== undefined && (
        <EditorArea
          key={selection.file + "/" + fileVersion}
          selection={selection}
          onSelectedFileChanged={setSelectedFile}
          onSimulatorExpand={handleSimulatorExpand}
          simulatorShown={simulatorShown}
          ref={simulatorButtonRef}
        />
      )}
    </Box>
  );

  return (
    <Flex className="WorkbenchContainer" flexDir="column">
      <Flex className="Workbench">
        <SplitView
          direction="row"
          width="100%"
          minimums={minimums}
          initialSize={Math.min(
            700,
            Math.max(
              minimums[0],
              Math.floor(window.innerWidth * sidebarToWidthRatio)
            )
          )}
          compactSize={86}
          mode={sidebarShown ? "open" : "compact"}
        >
          <SplitViewSized>
            <SideBar
              as="section"
              aria-label={intl.formatMessage({ id: "sidebar" })}
              selectedFile={selection.file}
              onSelectedFileChanged={setSelectedFile}
              flex="1 1 100%"
              shown={sidebarShown}
              tabIndex={tabIndex}
              onTabIndexChange={setTabIndex}
              onSidebarCollapse={handleSidebarCollapse}
              onSidebarExpand={handleSidebarExpand}
            />
          </SplitViewSized>
          <SplitViewDivider />
          <SplitViewRemainder>
            <EditorWithSimulator
              editor={editor}
              onSimulatorHide={handleSimulatorHide}
              simulatorShown={simulatorShown}
              showSimulatorButtonRef={simulatorButtonRef}
              simFocus={simFocus}
            />
          </SplitViewRemainder>
        </SplitView>
      </Flex>
      <Overlay />
    </Flex>
  );
};

interface EditorProps {
  editor: ReactNode;
}

interface EditorWithSimulatorProps extends EditorProps {
  simulatorShown: boolean;
  showSimulatorButtonRef: React.RefObject<HTMLButtonElement>;
  onSimulatorHide: () => void;
  simFocus: boolean;
}

const EditorWithSimulator = ({
  editor,
  simulatorShown,
  showSimulatorButtonRef,
  onSimulatorHide,
  simFocus,
}: EditorWithSimulatorProps) => {
  return (
    <SplitView
      direction="row"
      minimums={simulatorMinimums}
      height="100%"
      mode={simulatorShown ? "open" : "collapsed"}
      initialSize={Math.min(
        350,
        Math.max(
          simulatorMinimums[0],
          Math.floor(window.innerWidth * simulatorToWidthRatio)
        )
      )}
    >
      <SplitViewRemainder>
        <Editor editor={editor} />
      </SplitViewRemainder>
      <SplitViewDivider showBoxShadow={true} />
      <SplitViewSized>
        <Simulator
          shown={simulatorShown}
          onSimulatorHide={onSimulatorHide}
          showSimulatorButtonRef={showSimulatorButtonRef}
          minWidth={simulatorMinimums[0]}
          simFocus={simFocus}
        />
      </SplitViewSized>
    </SplitView>
  );
};

const Editor = ({ editor }: EditorProps) => {
  const intl = useIntl();
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  const [serialStateWhenOpen, setSerialStateWhenOpen] =
    useState<SizedMode>("compact");
  const serialSizedMode = connected ? serialStateWhenOpen : "collapsed";
  const [{ fontSize: settingsFontSizePt }] = useSettings();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <Flex
      as="main"
      flex="1 1 100%"
      flexDirection="column"
      height="100%"
      boxShadow="4px 0px 24px #00000033"
    >
      <SplitView
        direction="column"
        minimums={[248, 200]}
        compactSize={SerialArea.compactSize}
        height="100%"
        mode={serialSizedMode}
      >
        <SplitViewRemainder>{editor}</SplitViewRemainder>
        <SplitViewDivider />
        <SplitViewSized>
          <SerialArea
            as="section"
            compact={serialSizedMode === "compact"}
            onSizeChange={setSerialStateWhenOpen}
            aria-label={intl.formatMessage({
              id: "serial-terminal",
            })}
            showSyncStatus={true}
            expandDirection="up"
            tabOutRef={ref.current!}
            terminalFontSizePt={settingsFontSizePt}
          />
        </SplitViewSized>
      </SplitView>
      <ProjectActionBar
        ref={ref}
        sendButtonRef={ref}
        as="section"
        aria-label={intl.formatMessage({ id: "project-actions" })}
        borderTopWidth={2}
        borderColor="gray.200"
        overflow="hidden"
      />
    </Flex>
  );
};

export default Workbench;
