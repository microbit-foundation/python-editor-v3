import { AspectRatio, Box, Flex, VStack } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  SplitView,
  SplitViewDivider,
  SplitViewRemainder,
  SplitViewSized,
} from "../common/SplitView";
import { SizedMode } from "../common/SplitView/SplitView";
import SerialArea from "../serial/SerialArea";
import Sensors from "./Sensors";
import { useSimulator } from "./simulator-hooks";
import SimulatorActionBar from "./SimulatorActionBar";

const Simulator = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const { play, stop, sensors, onSensorChange } = useSimulator(ref);
  const intl = useIntl();
  const [serialStateWhenOpen, setSerialStateWhenOpen] =
    useState<SizedMode>("compact");
  return (
    <Flex flex="1 1 100%" flexDirection="column" height="100%">
      <SplitView
        direction="column"
        minimums={[248, 200]}
        compactSize={SerialArea.compactSize}
        height="100%"
        mode={serialStateWhenOpen}
      >
        <SplitViewRemainder>
          <VStack spacing={5} height="100%" bg="gray.25">
            <Box width="100%" boxShadow="lg" pb={2}>
              <AspectRatio ratio={191.27 / 155.77} width="100%">
                <Box
                  ref={ref}
                  as="iframe"
                  // This needs changing before we remove the flag.
                  src="https://stage-python-simulator.microbit.org/simulator.html"
                  title="Simulator"
                  frameBorder="no"
                  scrolling="no"
                  allow="autoplay;microphone"
                />
              </AspectRatio>
            </Box>
            <Sensors
              value={sensors}
              flex="1 1 auto"
              onSensorChange={onSensorChange}
            />
          </VStack>
        </SplitViewRemainder>
        <SplitViewDivider />
        <SplitViewSized>
          <SerialArea
            as="section"
            compact={serialStateWhenOpen === "compact"}
            onSizeChange={setSerialStateWhenOpen}
            aria-label={intl.formatMessage({
              id: "serial-terminal",
            })}
            showTerminal={true}
          />
        </SplitViewSized>
      </SplitView>
      <SimulatorActionBar
        onPlay={play}
        onStop={stop}
        as="section"
        aria-label={intl.formatMessage({ id: "project-actions" })}
        borderTopWidth={2}
        borderColor="gray.200"
        overflow="hidden"
      />
    </Flex>
  );
};

export default Simulator;
