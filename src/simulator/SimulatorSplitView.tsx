/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useIntl } from "react-intl";
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
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  const [serialStateWhenOpen, setSerialStateWhenOpen] =
    useState<SizedMode>("compact");
  const serialSizedMode = connected ? serialStateWhenOpen : "collapsed";
  const [tabOutRef] = useSimSerialTabControl();
  return (
    <SplitView
      direction="column"
      minimums={[150, 200]}
      compactSize={SerialArea.compactSize}
      height="0"
      flexGrow={1}
      mode={serialSizedMode}
    >
      <SplitViewSized>
        <SerialArea
          as="section"
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
      <SplitViewRemainder overflowY="auto">
        <Flex flexDirection="column" height="100%">
          <VStack spacing={5} bg="gray.25" flex="1 1 auto">
            <SimulatorModules flex="1 1 auto" running={simRunning} />
          </VStack>
        </Flex>
      </SplitViewRemainder>
    </SplitView>
  );
};

export default SimulatorSplitView;
