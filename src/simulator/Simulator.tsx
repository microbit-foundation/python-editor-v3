/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { AspectRatio, Box, Flex, useToken, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { topBarHeight } from "../deployment/misc";
import { DeviceContextProvider } from "../device/device-hooks";
import { SimulatorDeviceConnection } from "../device/simulator";
import SimulatorActionBar from "./SimulatorActionBar";
import SimulatorSplitView from "./SimulatorSplitView";

interface SimulatorProps {
  simulatorShown: boolean;
  setSimulatorShown: React.Dispatch<React.SetStateAction<boolean>>;
  showSimulatorButtonRef: React.RefObject<HTMLButtonElement>;
}

const Simulator = ({
  simulatorShown,
  setSimulatorShown,
  showSimulatorButtonRef,
}: SimulatorProps) => {
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
  const [brand500] = useToken("colors", ["brand.500"]);
  const hideSimulator = useCallback(() => {
    setSimulatorShown(false);
  }, [setSimulatorShown]);
  useEffect(() => {
    if (simulatorShown) {
      ref.current!.focus();
    } else {
      showSimulatorButtonRef.current!.focus();
    }
  }, [showSimulatorButtonRef, simulatorShown]);
  return (
    <DeviceContextProvider value={simulator.current}>
      <Flex
        flex="1 1 100%"
        flexDirection="column"
        height="100%"
        position="relative"
      >
        <Flex
          position="absolute"
          top={0}
          left={0}
          alignItems="center"
          height={topBarHeight}
        >
          <HideSplitViewButton
            aria-label={intl.formatMessage({ id: "simulator-collapse" })}
            handleClick={hideSimulator}
            splitViewShown={simulatorShown}
            direction="expandLeft"
          />
        </Flex>
        <VStack spacing={5} bg="gray.25" ref={simControlsRef}>
          <Box width="100%" pb={1} px={5} maxW="md">
            <AspectRatio ratio={191.27 / 155.77} width="100%">
              <Box
                ref={ref}
                as="iframe"
                // This needs changing before we remove the flag.
                src={`https://stage-python-simulator.microbit.org/simulator.html?color=${encodeURIComponent(
                  brand500
                )}`}
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
        <SimulatorSplitView simHeight={simHeight} />
      </Flex>
    </DeviceContextProvider>
  );
};

export default Simulator;
