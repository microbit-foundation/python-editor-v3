/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { AspectRatio, Box, Flex, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { DeviceContextProvider } from "../device/device-hooks";
import { SimulatorDeviceConnection } from "../device/simulator";
import { flags } from "../flags";
import SimulatorActionBar from "./SimulatorActionBar";
import SimulatorSplitView from "./SimulatorSplitView";

interface SimulatorProps {
  simulatorShown: boolean;
  setSimulatorShown: React.Dispatch<React.SetStateAction<boolean>>;
}

const Simulator = ({ simulatorShown, setSimulatorShown }: SimulatorProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const intl = useIntl();
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
  const simControlsRef = useRef<HTMLDivElement>(null);
  const simHeight = simControlsRef.current?.offsetHeight || 0;
  const handleHideSimulator = useCallback(() => {
    setSimulatorShown(false);
  }, [setSimulatorShown]);
  const handleShowSimulator = useCallback(() => {
    setSimulatorShown(true);
  }, [setSimulatorShown]);
  return (
    <DeviceContextProvider value={simulator.current}>
      <Flex
        flex="1 1 100%"
        flexDirection="column"
        height="100%"
        position="relative"
      >
        <VStack spacing={5} bg="gray.25" ref={simControlsRef}>
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
              handleHideSimulator={handleHideSimulator}
              handleShowSimulator={handleShowSimulator}
              simulatorShown={simulatorShown}
            />
          </Box>
        </VStack>
        <SimulatorSplitView simHeight={simHeight} />
        {!flags.showAlternative && (
          <HideSplitViewButton
            handleClick={handleHideSimulator}
            aria-label="Hide simulator"
            direction="right"
            left="-15px"
          />
        )}
      </Flex>
    </DeviceContextProvider>
  );
};

export default Simulator;
