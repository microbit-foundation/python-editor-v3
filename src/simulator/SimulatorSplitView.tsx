/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SplitView, SplitViewMode, SplitViewPane } from "@microbit/ui";
import { useState } from "react";
import { useIntl } from "react-intl";
import { Flex, VStack } from "styled-system/jsx";
import SplitViewSplitter from "../common/SplitView/SplitViewSplitter";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { useConnectionStatus } from "../device/device-hooks";
import SerialArea from "../serial/SerialArea";
import { RunningStatus } from "./Simulator";
import SimulatorModules from "./SimulatorModules";
import { useSimSerialTabControl } from "./tab-control-hooks";

interface SimulatorSplitViewProps {
  simRunning: RunningStatus;
}

const SimulatorSplitView = ({ simRunning }: SimulatorSplitViewProps) => {
  const intl = useIntl();
  const connected = useConnectionStatus() === ConnectionStatus.Connected;
  const [serialStateWhenOpen, setSerialStateWhenOpen] =
    useState<SplitViewMode>("compact");
  const serialSizedMode = connected ? serialStateWhenOpen : "collapsed";
  const [tabOutRef] = useSimSerialTabControl();
  return (
    <SplitView
      orientation="horizontal"
      primaryMinSize={150}
      secondaryMinSize={200}
      compactSize={SerialArea.compactSize}
      css={{ width: "100%", height: "0", flexGrow: 1 }}
      mode={serialSizedMode}
    >
      <SplitViewPane primary>
        <SerialArea
          terminalFontSizePt={12}
          compact={serialStateWhenOpen === "compact"}
          expandDirection="down"
          onSizeChange={setSerialStateWhenOpen}
          aria-label={intl.formatMessage({
            id: "simulator-serial-terminal",
          })}
          hideExpandTextOnTraceback={true}
          showSyncStatus={false}
          showHintsAndTips={false}
          tabOutRef={tabOutRef!}
        />
      </SplitViewPane>
      <SplitViewSplitter
        aria-label={intl.formatMessage({ id: "serial-terminal-resize" })}
      />
      <SplitViewPane css={{ overflowY: "auto" }}>
        <Flex flexDirection="column" height="100%">
          <VStack gap="5" bg="gray.75" flex="1 1 auto">
            <SimulatorModules css={{ flex: "1 1 auto" }} running={simRunning} />
          </VStack>
        </Flex>
      </SplitViewPane>
    </SplitView>
  );
};

export default SimulatorSplitView;
