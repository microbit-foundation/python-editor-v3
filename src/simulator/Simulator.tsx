/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { AspectRatio, Box, Flex, IconButton, VStack } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { RiDownloadLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { DeviceContextProvider } from "../device/device-hooks";
import { SimulatorDeviceConnection } from "../device/simulator";
import SimulatorActionBar from "./SimulatorActionBar";
import SimulatorSplitView from "./SimulatorSplitView";

interface SimulatorProps {
  setSimulatorShown: React.Dispatch<React.SetStateAction<boolean>>;
}

const Simulator = ({ setSimulatorShown }: SimulatorProps) => {
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
            />
          </Box>
        </VStack>
        <SimulatorSplitView simHeight={simHeight} />
        <IconButton
          borderTopLeftRadius={0}
          borderTopRightRadius={0}
          borderBottomRightRadius={6}
          borderBottomLeftRadius={6}
          size="sm"
          height="20px"
          width="50px"
          background="#eaecf1"
          color="brand.500"
          variant="ghost"
          bgColor="gray.200"
          icon={<RiDownloadLine />}
          aria-label="Hide simulator"
          position="absolute"
          left="-15px"
          top="50%"
          transform="translateY(-50%) rotate(270deg)"
          onClick={() => setSimulatorShown(false)}
        />
      </Flex>
    </DeviceContextProvider>
  );
};

export default Simulator;
