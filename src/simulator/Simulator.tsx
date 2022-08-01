import { AspectRatio, Box, Flex, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  SplitView,
  SplitViewDivider,
  SplitViewRemainder,
  SplitViewSized,
} from "../common/SplitView";
import { SizedMode } from "../common/SplitView/SplitView";
import { DeviceContextProvider } from "../device/device-hooks";
import { SimulatorDeviceConnection } from "../device/simulator";
import SerialArea from "../serial/SerialArea";
import Sensors from "./Sensors";
import SimulatorActionBar from "./SimulatorActionBar";

const Simulator = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const intl = useIntl();
  const [serialStateWhenOpen, setSerialStateWhenOpen] =
    useState<SizedMode>("compact");
  const simulator = useRef(
    new SimulatorDeviceConnection(() => {
      return ref.current;
    })
  );
  useEffect(() => {
    const sim = simulator.current;
    sim.initialize();
    return () => {
      sim.dispose();
    };
  }, []);
  return (
    <DeviceContextProvider value={simulator.current}>
      <Flex flex="1 1 100%" flexDirection="column" height="100%">
        <VStack spacing={5} bg="gray.25">
          <Box width="100%" pb={1}>
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
            <SimulatorActionBar
              as="section"
              aria-label={intl.formatMessage({ id: "project-actions" })}
              overflow="hidden"
            />
          </Box>
        </VStack>
        <SplitView
          direction="column"
          minimums={[150, 200]}
          compactSize={SerialArea.compactSize}
          height="100%"
          mode={serialStateWhenOpen}
        >
          <SplitViewSized>
            <SerialArea
              as="section"
              compact={serialStateWhenOpen === "compact"}
              onSizeChange={setSerialStateWhenOpen}
              aria-label={intl.formatMessage({
                id: "serial-terminal",
              })}
            />
          </SplitViewSized>
          <SplitViewDivider />
          <SplitViewRemainder>
            <VStack spacing={5} bg="gray.25" height="100%">
              <Sensors flex="1 1 auto" />
            </VStack>
          </SplitViewRemainder>
        </SplitView>
      </Flex>
    </DeviceContextProvider>
  );
};

export default Simulator;
