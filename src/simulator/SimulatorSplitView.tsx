/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useState } from "react";
import { useIntl } from "react-intl";
import { Flex, VStack } from "styled-system/jsx";
import {
  SplitView,
  SplitViewDivider,
  SplitViewRemainder,
  SplitViewSized,
} from "../common/SplitView";
import { SizedMode } from "../common/SplitView/SplitView";
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
    useState<SizedMode>("compact");
  const serialSizedMode = connected ? serialStateWhenOpen : "collapsed";
  const [tabOutRef] = useSimSerialTabControl();
  return (
    <SplitView
      direction="column"
      minimums={[150, 200]}
      compactSize={SerialArea.compactSize}
      css={{ height: "0", flexGrow: 1 }}
      mode={serialSizedMode}
    >
      <SplitViewSized>
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
      </SplitViewSized>
      <SplitViewDivider />
      <SplitViewRemainder css={{ overflowY: "auto" }}>
        <Flex flexDirection="column" height="100%">
          <VStack gap="5" bg="gray.75" flex="1 1 auto">
            <SimulatorModules css={{ flex: "1 1 auto" }} running={simRunning} />
          </VStack>
        </Flex>
      </SplitViewRemainder>
    </SplitView>
  );
};

export default SimulatorSplitView;
